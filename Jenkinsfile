node {
  checkout scm
  result_skip = sh(script: "git log -1 | grep '(wip)'", returnStatus: true)

  if (result_skip == 0) {
    echo "Skipping commit"
  } else {
    script {
      IMAGE = sh(returnStdout: true, script: "make get_image").trim()
      IMAGE_VISUAL = sh(returnStdout: true, script: "make get_image_visual").trim()
    }

    stage('Build and push image') {
      script {
        docker.withRegistry('https://docker.fela.space', 'docker.fela.space-registry') {
          sh 'make build_linux_amd64 push'
        }
      }
    }

    docker.withRegistry('https://docker.fela.space', 'docker.fela.space-registry') {
      def dbImage = docker.image('postgres:10-alpine')
      def redisImage = docker.image('redis:6.2-alpine')
      def budgetImage = docker.image("${IMAGE}")

      dbImage.withRun('-e POSTGRES_USER=docker -e POSTGRES_PASSWORD=docker') { pg ->
        dbImage.inside("--link ${pg.id}:db") {
          sh 'while ! psql postgres://docker:docker@db/postgres -c "select 1" > /dev/null 2>&1; do sleep 1; done'

          sh 'psql postgres://docker:docker@db/postgres -c "create database budget_test;"'
        }

        redisImage.withRun() { redis ->
          budgetImage.inside("--link ${pg.id}:db --link ${redis.id}:redis -e 'DATABASE_URL_TEST=postgres://docker:docker@db/budget_test' -e 'REDIS_HOST=redis' -e 'REDIS_PORT=6379' -v /var/local/codecov/budget:/app/coverage") {

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
            stage('Visual regression tests') {
              unstable('Visual regression tests are disabled')
            }
            stage('Coverage') {
              sh "cd /app && yarn coverage"
            }
          }
        }
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
