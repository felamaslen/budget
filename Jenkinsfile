pipeline {
  agent any

  environment {
    cache_dir = "/.cache/node_modules"
    cache_file = "budget.tar"
  }

  stages {
    stage('Check out') {
      steps {
        checkout scm
      }
    }
    stage('Build and push image') {
      steps {
        script {
          docker.withRegistry('https://docker.fela.space', 'docker.fela.space-registry') {
            sh 'make build push'
          }
        }
      }
    }
    stage('Run parallel tests') {
      parallel {
        stage('Lint') {
          steps {
            script {
              IMAGE = sh(returnStdout: true, script: "make get_image").trim()
              docker.withRegistry('https://docker.fela.space', 'docker.fela.space-registry') {
                docker.image("${IMAGE}").inside {
                  sh 'yarn install --frozen-lockfile'
                  sh 'yarn lint'
                }
              }
            }
          }
        }
        stage('Client unit tests') {
          steps {
            script {
              IMAGE = sh(returnStdout: true, script: "make get_image").trim()
              docker.withRegistry('https://docker.fela.space', 'docker.fela.space-registry') {
                docker.image("${IMAGE}").inside {
                  sh 'yarn install --frozen-lockfile'
                  sh 'yarn test:client'
                }
              }
            }
          }
        }
        stage('API unit tests') {
          steps {
            script {
              IMAGE = sh(returnStdout: true, script: "make get_image").trim()
              docker.withRegistry('https://docker.fela.space', 'docker.fela.space-registry') {
                docker.image("${IMAGE}").inside {
                  sh 'yarn install --frozen-lockfile'
                  sh 'yarn test:api:unit'
                }
              }
            }
          }
        }
      }
    }
    stage('API Integration tests') {
      steps {
        script {
          IMAGE = sh(returnStdout: true, script: "make get_image").trim()

          docker.image('postgres:10.4').withRun('-e POSTGRES_USER=docker -e POSTGRES_PASSWORD=docker') { pg ->

            docker.image('postgres:10.4').inside("--link ${pg.id}:db") {
              sh 'while ! psql postgres://docker:docker@db/postgres -c "select 1" > /dev/null 2>&1; do sleep 1; done'

              sh 'psql postgres://docker:docker@db/postgres -c "create database budget_test;"'
            }

            docker.withRegistry('https://docker.fela.space', 'docker.fela.space-registry') {
              docker.image("${IMAGE}").inside("--link ${pg.id}:db") {
                sh 'yarn install --frozen-lockfile'
                sh 'TEST_DATABASE_URL=postgres://docker:docker@db/budget_test yarn test:api:integration'
              }
            }
          }
        }
      }
    }
    stage('Deploy') {
      when {
        branch 'master'
      }
      steps {
        sh './k8s/deploy.sh'
      }
    }
  }
}
