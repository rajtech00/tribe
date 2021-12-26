const express = require('express');
const dotenv = require('dotenv');

const errorHandler = require('./middlewares/error.middleware');
const connectDb = require('./database/db');
const userRouter = require('./routes/user.route');

dotenv.config({ path: './config.env' });

const PORT = process.env.PORT || 4000;
//Connect to database
connectDb();

const app = express();

app.use(express.json());

app.use('/api/v1/auth', userRouter);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`app listening on ${process.env.NODE_ENV} mode port ${PORT}`);
});

//Handle unhandled promise rejection

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error:${err.message}`);
  server.close(() => process.exit(1));
});
