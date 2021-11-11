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

      GIT_REV = sh(returnStdout: true, script: "git rev-parse HEAD").trim()
      DATE = sh(returnStdout: true, script: "date -u +%s").trim()
      DB_TEMP_DIR = "/tmp/postgres-test-budget-${GIT_REV}-${DATE}"
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
    sh "mkdir -p ${DB_TEMP_DIR}"

    docker.withRegistry('https://docker.fela.space', 'docker.fela.space-registry') {
      def dbImage = docker.image('postgres:10-alpine')
      def redisImage = docker.image('redis:6.2-alpine')
      def budgetImage = docker.image("${IMAGE}")
      def visualImage = docker.image("${IMAGE_VISUAL}")

      dbImage.withRun("-e POSTGRES_USER=docker -e POSTGRES_PASSWORD=docker -v ${DB_TEMP_DIR}:/var/lib/postgresql") { pg ->
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
              try {
                sh "cd /app && CI=true yarn test:visual"
              } catch (err) {
                unstable('Visual regression test failed')
              }
            }
          }

          budgetImage.inside("-v ${COVERAGE_DIRECTORY}:/app/coverage") {
            stage('Coverage') {
              sh "cd /app && yarn coverage"
            }
          }
        }
      }
    }

    sh "rm -rf ${DB_TEMP_DIR}"

    if (env.BRANCH_NAME == "master") {
      stage('Deploy') {
        sh './k8s/migrate.sh'
        sh './k8s/deploy.sh'
      }
    }
  }
}
