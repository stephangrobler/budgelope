import dotenv from "dotenv";
const dotenvResult = dotenv.config({ path: "./server/.env" });
if (dotenvResult.error) {
  throw dotenvResult.error;
}
import express from "express";
import * as http from "http";

import * as winston from "winston";
import * as expressWinston from "express-winston";
import cors from "cors";
import { CommonRoutesConfig } from "./common/common.routes.config";
import { UsersRoutes } from "./users/users.routes.config";
import debug from "debug";
import { TransactionRoutes } from "./transactions/transactions.routes.config";
import { BudgetRoutes } from "./budgets/budgets.routes.config";
import { AccountRoutes } from "./accounts/accounts.routes.config";
import { PayeeRoutes } from "./payees/payees.routes.config";
import { CategoriesRoutes } from "./categories/categories.routes.config";
import { AuthRoutes } from "./auth/auth.routes.config";
import { CategoryGroupsRoutes } from "./categories_groups/category_groups.routes.config";

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = 5005;
const routes: Array<CommonRoutesConfig> = [];
const debugLog: debug.IDebugger = debug("app");

app.use(express.static(process.cwd()+"/web/dist/"));

// here we are adding middleware to parse all incoming requests as JSON
app.use(express.json());

// here we are adding middleware to allow cross-origin requests
app.use(cors());

// here we are preparing the expressWinston logging middleware configuration,
// which will automatically log all HTTP requests handled by Express.js
const loggerOptions: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize({ all: true })
  ),
};

if (!process.env.DEBUG) {
  loggerOptions.meta = false; // when not debugging, log requests as one-liners
}

// initialize the logger with the above configuration
app.use(expressWinston.logger(loggerOptions));

// here we are adding the UserRoutes to our array,
// after sending the Express.js application object to have the routes added to our app!
routes.push(new UsersRoutes(app));
routes.push(new TransactionRoutes(app));
routes.push(new BudgetRoutes(app));
routes.push(new AccountRoutes(app));
routes.push(new PayeeRoutes(app));
routes.push(new CategoriesRoutes(app));
routes.push(new CategoryGroupsRoutes(app));
routes.push(new AuthRoutes(app));

// this is a simple route to make sure everything is working properly
const runningMessage = `Server running at http://localhost:${port}`;
app.get("/", (req: express.Request, res: express.Response) => {
  res.status(200).send(runningMessage);res.sendFile(process.cwd()+"/web/dist/index.html")
});

// huh?
server.listen(port, () => {
  debugLog(`Server running at http://localhost:${port}`);
  routes.forEach((route: CommonRoutesConfig) => {
    debugLog(`Routes configured for ${route.getName()}`);
  });
});
