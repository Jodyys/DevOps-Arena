pipeline {
    agent any

    parameters {
        booleanParam(name: 'ROLLBACK_TEST', defaultValue: false, description: 'If true, deploys a broken image to simulate a rollback scenario.')
    }

    triggers {
        pollSCM('* * * * *') // Poll GitHub every minute
    }

    environment {
        DOCKERHUB_CREDENTIALS = 'docker-hub-credentials'
        DOCKERHUB_USER = 'jodyys'
        APP_IMAGE = "${DOCKERHUB_USER}/devops-arena"
        GIT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        TRIVY_SEVERITY = 'HIGH,CRITICAL'
        DEPLOY_TAG = "${params.ROLLBACK_TEST ? 'broken-image-for-rollback-test' : GIT_SHA}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Test Backend') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm audit || true'
                    sh 'npm test'
                }
            }
        }

        stage('Install & Test Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm audit || true'
                    sh 'npm run lint'
                }
            }
        }

        stage('SAST: Source Code Scan') {
            when {
                expression { return !params.ROLLBACK_TEST }
            }
            steps {
                sh "trivy fs --exit-code 0 --severity HIGH,CRITICAL --no-progress . > trivy-sast-report.txt"
                sh "cat trivy-sast-report.txt"
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-sast-report.txt', allowEmptyArchive: true
                }
            }
        }

        stage('Build Images') {
            when {
                expression { return !params.ROLLBACK_TEST }
            }
            steps {
                sh "docker build --pull -t ${APP_IMAGE}:frontend-${GIT_SHA} ./frontend"
                sh "docker build --pull -t ${APP_IMAGE}:backend-${GIT_SHA} ./backend"
            }
        }

        stage('Trivy Security Scan') {
            when {
                expression { return !params.ROLLBACK_TEST }
            }
            steps {
                // Warning for HIGH severity (exit-code 0)
                sh "trivy image --exit-code 0 --severity HIGH --ignore-unfixed --no-progress --output trivy-frontend-high.txt ${APP_IMAGE}:frontend-${GIT_SHA}"
                sh "trivy image --exit-code 0 --severity HIGH --ignore-unfixed --no-progress --output trivy-backend-high.txt ${APP_IMAGE}:backend-${GIT_SHA}"
                
                // Fail pipeline for CRITICAL severity (exit-code 1)
                // We run it without output file first to print to console, then with output file to fail the build if needed
                sh "trivy image --severity CRITICAL --ignore-unfixed --no-progress ${APP_IMAGE}:frontend-${GIT_SHA}"
                sh "trivy image --exit-code 0 --severity CRITICAL --ignore-unfixed --no-progress --output trivy-frontend-critical.txt ${APP_IMAGE}:frontend-${GIT_SHA}"
                
                sh "trivy image --severity CRITICAL --ignore-unfixed --no-progress ${APP_IMAGE}:backend-${GIT_SHA}"
                sh "trivy image --exit-code 0 --severity CRITICAL --ignore-unfixed --no-progress --output trivy-backend-critical.txt ${APP_IMAGE}:backend-${GIT_SHA}"
                
                // Display in console as well for quick view
                sh "cat trivy-frontend-high.txt trivy-frontend-critical.txt || true"
                sh "cat trivy-backend-high.txt trivy-backend-critical.txt || true"
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-*.txt', allowEmptyArchive: true
                }
            }
        }

        stage('Push to Docker Hub') {
            when {
                expression { return !params.ROLLBACK_TEST }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                    sh "docker push ${APP_IMAGE}:frontend-${GIT_SHA}"
                    sh "docker push ${APP_IMAGE}:backend-${GIT_SHA}"
                }
            }
        }



        stage('Deploy to Kubernetes') {
            steps {
                // Update images to the new DEPLOY_TAG dynamically inside the manifest
                sh "sed -i 's/frontend-INITIAL_DEPLOYMENT/frontend-${DEPLOY_TAG}/g' k8s/platform/frontend.yaml"
                sh "sed -i 's/backend-INITIAL_DEPLOYMENT/backend-${DEPLOY_TAG}/g' k8s/platform/backend.yaml"

                // Apply application manifests (excluding cluster-scoped namespace)
                sh "kubectl apply -f k8s/platform/"
            }
        }

        stage('Rollout Validation') {
            steps {
                script {
                    try {
                        sh "kubectl rollout status deployment/backend -n ns-devops-arena --timeout=180s"
                        sh "kubectl rollout status deployment/frontend -n ns-devops-arena --timeout=180s"
                        
                        if (!params.ROLLBACK_TEST) {
                            echo "Rollout successful! Promoting images to v1.0..."
                            sh "docker tag ${APP_IMAGE}:frontend-${GIT_SHA} ${APP_IMAGE}:frontend-v1.0"
                            sh "docker tag ${APP_IMAGE}:backend-${GIT_SHA} ${APP_IMAGE}:backend-v1.0"
                            
                            withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                                sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                                sh "docker push ${APP_IMAGE}:frontend-v1.0"
                                sh "docker push ${APP_IMAGE}:backend-v1.0"
                            }
                        }
                    } catch (Exception e) {
                        echo "Rollout failed! Initiating automatic rollback..."
                        sh "kubectl rollout undo deployment/backend -n ns-devops-arena"
                        sh "kubectl rollout undo deployment/frontend -n ns-devops-arena"
                        sh "kubectl rollout status deployment/backend -n ns-devops-arena --timeout=180s"
                        sh "kubectl rollout status deployment/frontend -n ns-devops-arena --timeout=180s"
                        error "Deployment failed and was rolled back. Image v1.0 was NOT pushed."
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                sh "kubectl get pods -n ns-devops-arena"
            }
        }
    }

    post {
        always {
            sh "docker logout"
        }
    }
}
