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
                }
            }
        }

        stage('Install & Test Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Images') {
            when {
                expression { return !params.ROLLBACK_TEST }
            }
            steps {
                sh "docker build -t ${APP_IMAGE}:frontend-${GIT_SHA} ./frontend"
                sh "docker build -t ${APP_IMAGE}:backend-${GIT_SHA} ./backend"
            }
        }

        stage('Trivy Security Scan') {
            when {
                expression { return !params.ROLLBACK_TEST }
            }
            steps {
                sh "trivy image --exit-code 1 --severity ${TRIVY_SEVERITY} --no-progress ${APP_IMAGE}:frontend-${GIT_SHA}"
                sh "trivy image --exit-code 1 --severity ${TRIVY_SEVERITY} --no-progress ${APP_IMAGE}:backend-${GIT_SHA}"
            }
        }

        stage('Push to Docker Hub (SHA Tag)') {
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
                // Apply namespace first
                sh "kubectl apply -f k8s/application/namespace.yaml"
                
                // Apply manifests
                sh "kubectl apply -f k8s/application/"

                // Update images to the new DEPLOY_TAG
                sh "kubectl set image deployment/frontend frontend=${APP_IMAGE}:frontend-${DEPLOY_TAG} -n ns-devops-arena"
                sh "kubectl set image deployment/backend backend=${APP_IMAGE}:backend-${DEPLOY_TAG} -n ns-devops-arena"
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
