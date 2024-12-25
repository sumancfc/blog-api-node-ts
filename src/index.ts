import express, { Request, Response, NextFunction } from 'express';

const app = express();

app.get('/api', (req: Request, res: Response, next: NextFunction) => {
    res.send('Hello, TypeScript!');
});

export default app;
