import express from 'express'
import embed from '../controller/embedding.controller'

const route = express.Router();

route.get('/', embed);

export default route;