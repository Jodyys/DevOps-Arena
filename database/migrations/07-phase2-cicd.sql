-- Phase 2 CI/CD Missions

INSERT INTO missions (id, level_id, title, description, objective, difficulty, xp_reward, hints, prerequisites, solution) VALUES
(21, 4, 'Jenkins Pipeline Syntax Error', 'A Jenkinsfile is failing to execute because of a syntax error. Find and fix the missing bracket in /workspace/Jenkinsfile.', 'Fix the syntax error in /workspace/Jenkinsfile.', 'Easy', 1200, '["Look at the stages section. There is a missing closing brace }"]', '[16]', 'kubectl exec'),
(22, 4, 'Failing Unit Test in Pipeline', 'A Node.js pipeline fails during the test stage because of a broken unit test. Fix the assertion in /workspace/test.js so the test passes.', 'Edit /workspace/test.js to make the test pass.', 'Medium', 1500, '["Change the expected value in the assertion to match the actual result.", "The function returns 5, but the test expects 4."] ', '[21]', 'kubectl exec'),
(23, 4, 'Docker Build Error in Pipeline', 'The CI pipeline is failing during the Docker build stage. Fix the /workspace/Dockerfile which is missing a required instruction.', 'Edit /workspace/Dockerfile to fix the build error.', 'Medium', 1500, '["The Dockerfile is missing the FROM instruction at the top.", "Add FROM node:18-alpine at the beginning of the file."] ', '[21]', 'kubectl exec'),
(24, 4, 'Failing Integration Test', 'The integration test script /workspace/run-tests.sh is failing because it tries to connect to the wrong database host.', 'Edit /workspace/run-tests.sh and update DB_HOST to point to db-server.', 'Hard', 2000, '["Open /workspace/run-tests.sh and find the DB_HOST variable.", "Change it from localhost to db-server."] ', '[22, 23]', 'kubectl exec'),
(25, 4, 'Image Push Authentication Error', 'The pipeline fails to push the Docker image because it lacks registry credentials. Fix /workspace/push.sh by adding the proper docker login command.', 'Add the docker login command before the docker push command in /workspace/push.sh.', 'Hard', 2500, '["Add docker login -u admin -p secret123 to push.sh before pushing.", "Don''t forget to save the file!"] ', '[24]', 'kubectl exec')
ON CONFLICT (id) DO UPDATE SET 
    level_id = EXCLUDED.level_id,
    title = EXCLUDED.title, 
    description = EXCLUDED.description, 
    objective = EXCLUDED.objective, 
    difficulty = EXCLUDED.difficulty, 
    xp_reward = EXCLUDED.xp_reward, 
    hints = EXCLUDED.hints, 
    prerequisites = EXCLUDED.prerequisites,
    solution = EXCLUDED.solution;

SELECT setval('missions_id_seq', (SELECT MAX(id) FROM missions));
