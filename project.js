'use strict';
//https://app.graphenedb.com/dbs/Olga/overview   maximusjp@wp.pl || 29862986
//https://neo4j.com/sandbox-v2/ maximusjp@wp.pl || 1234
// npm install --save neo4j-driver

const neo4j = require('neo4j-driver').v1;
const Inert = require('inert');
const Joi = require('joi');
const HapiDocs = require('hapi-docs');

var driver = neo4j.driver('bolt://hobby-mgfbopedajfpgbkejpbcmedl.dbs.graphenedb.com:24787', neo4j.auth.basic('admin', 'b.WOMbUKATn6uS.7bXicKU8jSRi6gqm'));
// var driver = neo4j.driver('bolt://ws-10-0-1-63-34943.neo4jsandbox.com:443', neo4j.auth.basic('neo4j', 'proposes-standing-analyzers'));
//b.WOMbUKATn6uS.7bXicKU8jSRi6gqm
//b.T5vNsV8ogmPV.KAjRsAsgCHl087I9

var session = driver.session();

console.log('API server starting...');

const Hapi = require('hapi');
const init = async () => {

  const server = Hapi.server({
    port: process.env.PORT || 4000,
    host: '0.0.0.0',
    routes: {
      cors: true
    }
  });

  server.route({
    method: 'GET',
    path: '/actors',
    options: {
      description: 'Get list of actors from graph database',
      notes: 'MATCH (people:Person) RETURN people.name,people.born',
      tags: ['api'],
      plugins: {
        'hapi-docs': {
          order: 1
        }
      }
    },
    handler: (request, h) => {
      return session.run('MATCH (people:Person) RETURN people.name,people.born', {})
        .then(result => {
          return result.records;
        })
        .catch(error => {
          console.log(error);
          return error;
        })
    }
  });

  server.route({
    method: 'GET',
    path: '/actors/{movie}',
    options: {
      description: 'Get all actors for selected movie',
      notes: 'MATCH (m:Movie {title: "title"})<-[:ACTED_IN]-(mActors) RETURN mActors.name,mActors.born`.',
      tags: ['api'],
      validate: {
        params: {
          movie: Joi.string()
            .required()
            .description('Title of the movie')
        }
      },
      plugins: {
        'hapi-docs': {
          order: 2
        }
      }
    },
    handler: (request, h) => {
      return session.run(`MATCH (m:Movie {title: "${request.params.movie}"})<-[:ACTED_IN]-(mActors) RETURN mActors.name,mActors.born`, {})
        .then(result => {
          return result.records;
        })
        .catch(error => {
          console.log(error);
          return error;
        })
    }
  });

  server.route({
    method: 'GET',
    path: '/movies',
    options: {
      description: 'Get list of movies from graph database',
      notes: 'MATCH (movie:Movie) RETURN movie.title, movie.tagline, movie.released',
      tags: ['api'],
      plugins: {
        'hapi-docs': {
          order: 1
        }
      }
    },
    handler: (request, h) => {
      return session.run('MATCH (movie:Movie) RETURN movie.title, movie.tagline, movie.released', {})
        .then(result => {
          return result.records;
        })
        .catch(error => {
          console.log(error);
          return error;
        })
    }
  });

  server.route({
    method: 'GET',
    path: '/movies/{actor}',
    options: {
      description: 'Get all movies in which selected actor was played',
      notes: 'MATCH (p:Person {name: "name"})-[:ACTED_IN]->(pMovies) RETURN pMovies.title,pMovies.tagline,pMovies.released',
      tags: ['api'],
      validate: {
        params: {
          actor: Joi.string()
            .required()
            .description('Full name of actor')
        }
      },
      plugins: {
        'hapi-docs': {
          order: 2
        }
      }
    },
    handler: (request, h) => {
      return session.run(`MATCH (p:Person {name: "${request.params.actor}"})-[:ACTED_IN]->(pMovies) RETURN pMovies.title,pMovies.tagline,pMovies.released`, {})
        .then(result => {
          return result.records;
        })
        .catch(error => {
          console.log(error);
          return error;
        })
    }
  });

  server.route({
    method: 'PUT',
    path: '/movie',
    options: {
      description: 'Insert new movie into database',
      notes: 'CREATE (m:Movie {title:\'title\', released:date, tagline:\'tag\'})',
      tags: ['api'],
      validate: {
        query: {
          title: Joi.string().required().description('Title of the movie'),
          released: Joi.string().required().description('Date of release'),
          tag: Joi.string().required().description('Tag line'),
        }
      },
      plugins: {
        'hapi-docs': {
          order: 1
        }
      }
    },
    handler: (request, h) => {
      return session.run(`CREATE (m:Movie {title:'${request.query.title}', released:${request.query.released}, tagline:'${request.query.tag}'})`, {})
        .then(result => {
          return result.records;
        })
        .catch(error => {
          console.log(error);
          return error;
        })
    }
  });

  server.route({
    method: 'PUT',
    path: '/actor', options: {
      description: 'Insert new actor into database',
      notes: 'CREATE (p:Person {name:"name", born:"date"})',
      tags: ['api'],
      validate: {
        query: {
          person: Joi.string().required().description('Fullname of the actor'),
          born: Joi.string().required().description('Date of born'),
        }
      },
      plugins: {
        'hapi-docs': {
          order: 1
        }
      }
    },
    handler: (request, h) => {
      return session.run(`CREATE (p:Person {name:"${request.query.person}", born:${request.query.born}})`, {})
        .then(result => {
          return result.records;
        })
        .catch(error => {
          console.log(error);
          return error;
        })
    }
  });

  server.route({
    method: 'PUT',
    path: '/relationship',
    options: {
      description: 'Link actor to the movie',
      notes: 'CREATE (p)-[:ACTED_IN {roles:[\'rolename\']}]->(m)',
      tags: ['api'],
      validate: {
        query: {
          movie: Joi.string().required().description('Title of the movie'),
          person: Joi.string().required().description('Full name of the actor'),
          role: Joi.string().required().description('Role name'),
        }
      },
      plugins: {
        'hapi-docs': {
          order: 1
        }
      }
    },
    handler: (request, h) => {
      return session.run(`MATCH (p:Person {name: "${request.query.person}"}) 
                        MATCH (m:Movie {title: "${request.query.movie}"}) 
                        CREATE (p)-[:ACTED_IN {roles:['${request.query.role}']}]->(m)`, {})
        .then(result => {
          return result.records;
        })
        .catch(error => {
          console.log(error);
          return error;
        })
    }
  });

  const options = {
    sortTags: 'ordered',
    sortEndpoints: 'ordered',
    info: {
      descriptions: [
        'The API is organized around [REST](http://en.wikipedia.org/wiki/Representational_State_Transfer). Our API has predictable, resource-oriented URLs, and uses HTTP response codes to indicate API errors. We use built-in HTTP features, like HTTP authentication and HTTP verbs, which are understood by off-the-shelf HTTP clients. We support [cross-origin resource sharing](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing), allowing you to interact securely with our API from a client-side web application (though you should never expose your secret API key in any public website’s client-side code). [JSON](http://www.json.org) is returned by all API responses, including errors.'
      ]
    },
    errors: {
      descriptions: [
        'The API uses conventional HTTP response codes to indicate the success or failure of an API request. In general: Codes in the `2xx` range indicate success. Codes in the `4xx` range indicate an error that failed given the information provided (e.g., a required parameter was omitted, a charge failed, etc.). Codes in the `5xx` range indicate an error with servers (these are rare).'
      ],
      codes: [
        {
          status: '200 - OK',
          description: 'Everything worked as expected.'
        },
        {
          status: '400 - Bad Request',
          description:
            'The request was unacceptable, often due to missing a required parameter.'
        },
        {
          status: '401 - Unauthorized',
          description: 'No valid API key provided.'
        },
        {
          status: '402 - Request Failed',
          description: 'The parameters were valid but the request failed.'
        },
        {
          status: '404 - Not Found',
          description: 'The requested resource doesn’t exist.'
        },
        {
          status: '409 - Conflict',
          description:
            'The request conflicts with another request (perhaps due to using the same idempotent key).'
        },
        {
          status: '429 - Too Many Requests',
          description:
            'Too many requests hit the API too quickly. We recommend an exponential backoff of your requests.'
        },
        {
          status: '500, 502, 503, 504 - Server Errors',
          description: 'Something went wrong on our end. (These are rare.)'
        }
      ]
    }
  }

  await server.register([
    {
      plugin: Inert
    },
    {
      plugin: HapiDocs,
      options
    }
  ])

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();
