class NotificationService {
  static async sendNotification(userId, message) {
    console.log(`Sending notification to user ${userId}: ${message}`);
  }
}

module.exports = NotificationService;
