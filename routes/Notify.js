const express = require("express");
const router = express.Router();

const notificationcontroller = require("../controller/notificationcontroller");

router.get(
  "/fetchAllNotification/:userId",
  notificationcontroller.fetchAllNotification
);
router.post(
  "/sendPropertyAssignmentNotification/:brokerEmail",
  notificationcontroller.sendPropertyAssignmentNotification
);
router.post(
  "/sendPropertyPostedNotification/:userRole",
  notificationcontroller.sendPropertyPostedNotification
);
router.post(
  "/sendPropertyRegistrationNotification/:brokerAdminRole",
  notificationcontroller.sendPropertyRegistrationNotification
);
router.put(
  "/markAllSeenNotificationAsRead/:id",
  notificationcontroller.markAllSeenNotificationAsRead
);

module.exports = router;
