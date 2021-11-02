node {
  checkout scm
  result_skip = sh(script: "git log -1 | grep '(wip)'", returnStatus: true)

  if (result_skip == 0) {
    echo "Skipping commit"
  } else {
    script {
      IMAGE = sh(returnStdout: true, script: "make get_image").trim()
      IMAGE_VISUAL = sh(returnStdout: true, script: "make get_image_visual").trim()

      COVERAGE_DIRECTORY = "/var/local/codecov/budget/${env.BRANCH_NAME}"
    }

    stage('Build and push image') {
      script {
        docker.withRegistry('https://docker.fela.space', 'docker.fela.space-registry') {
          sh 'make build_linux_amd64 push'
          sh 'make build_visual'
        }
      }
    }

    sh "mkdir -p ${COVERAGE_DIRECTORY}"

    docker.withRegistry('https://docker.fela.space', 'docker.fela.space-registry') {
      def dbImage = docker.image('postgres:10-alpine')
      def redisImage = docker.image('redis:6.2-alpine')
      def budgetImage = docker.image("${IMAGE}")
      def visualImage = docker.image("${IMAGE_VISUAL}")

      dbImage.withRun('-e POSTGRES_USER=docker -e POSTGRES_PASSWORD=docker') { pg ->
        dbImage.inside("--link ${pg.id}:db") {
          sh 'while ! psql postgres://docker:docker@db/postgres -c "select 1" > /dev/null 2>&1; do sleep 1; done'

          sh 'psql postgres://docker:docker@db/postgres -c "create database budget_test;"'
        }

        redisImage.withRun() { redis ->
          budgetImage.inside("--link ${pg.id}:db --link ${redis.id}:redis -e 'DATABASE_URL_TEST=postgres://docker:docker@db/budget_test' -e 'REDIS_HOST=redis' -e 'REDIS_PORT=6379' -v ${COVERAGE_DIRECTORY}:/app/coverage") {

            stage('Lint') {
              sh "cd /app && yarn lint"
              sh "cd /app && yarn prettier"
            }

            stage('API unit tests') {
              sh "cd /app && CI=true yarn test:api:unit:ci"
            }
            stage('API integration tests') {
              sh "cd /app && CI=true yarn test:api:integration"
            }
            stage('Client unit tests') {
              sh "cd /app && CI=true yarn test:client:ci"
            }
          }

          visualImage.inside("-v ${COVERAGE_DIRECTORY}:/app/coverage") {
            stage('Visual regression tests') {
              sh "cd /app && CI=true yarn test:visual"
            }
          }
        }
      }

      stage('Coverage') {
        sh "yarn ts-node-script ./scripts/merge-coverage.ts --report ${COVERAGE_DIRECTORY}/api/unit/coverage-final.json ${COVERAGE_DIRECTORY}/api/integration/coverage-final.json ${COVERAGE_DIRECTORY}/client/coverage-final.json ${COVERAGE_DIRECTORY}/visual/coverage-final.json"
        sh "mv -v coverage/* ${COVERAGE_DIRECTORY}"
      }
    }

    if (env.BRANCH_NAME == "master") {
      stage('Deploy') {
        sh './k8s/migrate.sh'
        sh './k8s/deploy.sh'
      }
    }
  }
}
