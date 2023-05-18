import NotificationRouteV1 from "./routes/v1/notification.route";
import App from "./app";
import AuthRouteV1 from "./routes/v1/auth.route";
import ChatRouteV1 from "./routes/v1/chat.route";
import EventRouteV1 from "./routes/v1/event.route";
import SearchKeyWordsRouteV1 from "./routes/v1/search_keywords.route";
import MetadataRouteV1 from "./routes/v1/metadata.route";
import PostRouteV1 from "./routes/v1/post.route";
import TaskRouteV1 from "./routes/v1/task.route";
import UploadRouteV1 from "./routes/v1/upload.route";
import UserRouteV1 from "./routes/v1/user.route";
import KanbanRouteV1 from "./routes/v1/kanban.route";
import GoogleAnalyticsRouteV1 from "./routes/v1/ga.route";

const app = new App([
  new AuthRouteV1(),
  new ChatRouteV1(),
  new EventRouteV1(),
  new MetadataRouteV1(),
  new UploadRouteV1(),
  new PostRouteV1(),
  new TaskRouteV1(),
  new UserRouteV1(),
  new NotificationRouteV1(),
  new KanbanRouteV1(),
  new SearchKeyWordsRouteV1(),
  new GoogleAnalyticsRouteV1(),
]);

app.listen();
export { app };
