node {
  checkout scm

  script {
    IMAGE = sh(returnStdout: true, script: "make get_image").trim()
  }

  stage('Build and push image') {
    script {
      docker.withRegistry('https://docker.fela.space', 'docker.fela.space-registry') {
        sh 'rm -rf node_modules'
        sh 'make build push'
      }
    }
  }

  docker.withRegistry('https://docker.fela.space', 'docker.fela.space-registry') {
    docker.image('postgres:10.4').withRun('-e POSTGRES_USER=docker -e POSTGRES_PASSWORD=docker') { pg ->

      docker.image('postgres:10.4').inside("--link ${pg.id}:db") {
        sh 'while ! psql postgres://docker:docker@db/postgres -c "select 1" > /dev/null 2>&1; do sleep 1; done'

        sh 'psql postgres://docker:docker@db/postgres -c "create database budget_test;"'
      }

      stage('Run parallel tests') {
        parallel([
          "Lint": {
            sh "docker run --rm ${IMAGE} sh -c 'yarn lint'"
          },
          "Client unit tests": {
            sh "docker run --rm ${IMAGE} sh -c 'yarn test:client'"
          },
          "API unit tests": {
            sh "docker run --rm ${IMAGE} sh -c 'yarn test:api:unit'"
          }
        ])
      }

      stage('API integration tests') {
        sh "docker run --rm --link ${pg.id}:db -e 'TEST_DATABASE_URL=postgres://docker:docker@db/budget_test' ${IMAGE} sh -c 'yarn test:api:integration'"
      }
    }
  }

  stage('Deploy') {
    if (env.BRANCH_NAME == "master") {
      sh './k8s/deploy.sh'
    }
  }
}
