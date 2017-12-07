import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the AIS chat API!' });
});

router.route('/time').get((req, res) => {
  const currTime = new Date().getTime();
  res.json({ currTime });
});

export default router;
