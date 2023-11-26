import { Express } from "express";

const app = Express();
app.listen(3000, () => {
  console.log("server start");
});
console.log('server listen on port',3000)
