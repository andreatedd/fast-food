import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'FastFood App API',
        description: 'Documentazione delle API per il progetto FastFood',
        version: '1.0.0'
    },
    servers: [
        {
            url: "http://localhost:3000"
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    security: [{ bearerAuth: [] }]
};

const outputFile = './swagger.json';
const endpointsFiles = ['./app.js'];

const autogen = swaggerAutogen({ openapi: '3.0.0' });

autogen(outputFile, endpointsFiles, doc).then(() => {
    console.log("File swagger.json generato con successo!");
});