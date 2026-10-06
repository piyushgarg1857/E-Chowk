class AppSession {
  static String? accessToken;
  static String? userId;
  static String? role;

  static Map<String, String> get authHeaders => {
    'Content-Type': 'application/json',
    if (accessToken != null) 'Authorization': 'Bearer $accessToken',
  };

  static void setAuth(Map<String, dynamic> data) {
    accessToken = data['access_token'] as String?;
    final user = data['user'];
    if (user is Map) {
      userId = user['id']?.toString();
      role = user['role']?.toString();
    }
  }

  static void clear() {
    accessToken = null;
    userId = null;
    role = null;
  }
}
