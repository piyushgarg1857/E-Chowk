import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'config.dart';
import 'services/session.dart';
import 'e_chowk_theme.dart';

class EmployerScreen extends StatefulWidget {
  const EmployerScreen({Key? key}) : super(key: key);

  @override
  State<EmployerScreen> createState() => _EmployerScreenState();
}

class _EmployerScreenState extends State<EmployerScreen> {
  final String apiUrl = apiBaseUrl;
  List<Map<String, dynamic>> _allWorkers = [];
  List<Map<String, dynamic>> _filteredWorkers = [];
  List<Map<String, dynamic>> _myJobs = [];
  bool _isLoading = true;
  int _unreadNotifications = 0;
  String _selectedSkill = 'All';
  String _searchQuery = '';
  final TextEditingController _searchCtrl = TextEditingController();

  final List<String> _skills = ['All', 'Carpenter', 'Electrician', 'Plumber', 'Driver', 'Painter', 'Mason', 'Helper'];
  final Map<String, IconData> _skillIcons = {
    'All': Icons.list_alt,
    'Carpenter': Icons.carpenter,
    'Electrician': Icons.electrical_services,
    'Plumber': Icons.plumbing,
    'Driver': Icons.drive_eta,
    'Painter': Icons.format_paint,
    'Mason': Icons.construction,
    'Helper': Icons.handshake,
  };

  @override
  void initState() {
    super.initState();
    _loadWorkers();
    _loadNotificationCount();
    _loadMyJobs();
  }

  Future<void> _loadNotificationCount() async {
    try {
      final response = await http.get(Uri.parse('$apiUrl/notifications'), headers: AppSession.authHeaders);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);
        if (data is List && mounted) setState(() => _unreadNotifications = data.where((n) => n['read_at'] == null).length);
      }
    } catch (_) {}
  }

  Future<void> _showNotifications() async {
    try {
      final response = await http.get(Uri.parse('$apiUrl/notifications'), headers: AppSession.authHeaders);
      if (!mounted) return;
      final data = response.statusCode >= 200 && response.statusCode < 300 ? jsonDecode(response.body) : [];
      final notifications = data is List ? List<Map<String, dynamic>>.from(data) : <Map<String, dynamic>>[];
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Notifications'),
          content: SizedBox(
            width: 420,
            child: notifications.isEmpty
                ? const Text('अभी कोई notification नहीं है.')
                : ListView(
                    shrinkWrap: true,
                    children: notifications.take(20).map((n) => ListTile(
                      leading: Icon(n['read_at'] == null ? Icons.notifications_active : Icons.notifications_none),
                      title: Text(n['title']?.toString() ?? 'E-Chowk'),
                      subtitle: Text(n['body']?.toString() ?? ''),
                    )).toList(),
                  ),
          ),
          actions: [
            TextButton(onPressed: () async {
              await http.patch(Uri.parse('$apiUrl/notifications/read-all'), headers: AppSession.authHeaders);
              if (ctx.mounted) Navigator.pop(ctx);
              if (mounted) setState(() => _unreadNotifications = 0);
            }, child: const Text('Mark all read')),
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close')),
          ],
        ),
      );
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Notifications load नहीं हुईं')));
    }
  }

  Future<void> _loadWorkers() async {
    setState(() => _isLoading = true);
    try {
      final response = await http.get(Uri.parse('$apiUrl/voice/workers'), headers: AppSession.authHeaders);
      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        setState(() {
          _allWorkers = List<Map<String, dynamic>>.from(data['workers']);
          _filteredWorkers = _allWorkers;
        });
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Workers load नहीं हो पाए')));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _applyFilter() {
    setState(() {
      _filteredWorkers = _allWorkers.where((w) {
        final matchSkill = _selectedSkill == 'All' ||
            (w['skill_category'] ?? '').toString().toLowerCase().contains(_selectedSkill.toLowerCase());
        final matchSearch = _searchQuery.isEmpty ||
            (w['full_name'] ?? '').toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
            (w['current_location'] ?? '').toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
            (w['skill_category'] ?? '').toString().toLowerCase().contains(_searchQuery.toLowerCase());
        return matchSkill && matchSearch;
      }).toList();
    });
  }

  Future<void> _loadMyJobs() async {
    try {
      final response = await http.get(Uri.parse('$apiUrl/jobs/mine'), headers: AppSession.authHeaders);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);
        if (data is List && mounted) setState(() => _myJobs = List<Map<String, dynamic>>.from(data));
      }
    } catch (_) {}
  }

  Future<void> _viewApplications(Map<String, dynamic> job) async {
    final id = job['id']?.toString();
    if (id == null) return;
    try {
      final response = await http.get(Uri.parse('$apiUrl/jobs/$id/applications'), headers: AppSession.authHeaders);
      if (!mounted) return;
      if (response.statusCode < 200 || response.statusCode >= 300) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Applications load नहीं हुईं')));
        return;
      }
      final data = jsonDecode(response.body);
      final apps = data is List ? List<Map<String, dynamic>>.from(data) : <Map<String, dynamic>>[];
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: Text('Applications · ${job['required_skill'] ?? 'Job'}'),
          content: SizedBox(
            width: 420,
            child: apps.isEmpty
                ? const Text('अभी कोई application नहीं आई.')
                : ListView(
                    shrinkWrap: true,
                    children: apps.map((app) {
                      final status = app['status']?.toString() ?? 'pending';
                      return ListTile(
                        leading: const CircleAvatar(child: Icon(Icons.person)),
                        title: Text('Worker ${app['worker_id'] ?? ''}'),
                        subtitle: Text(status),
                        trailing: status == 'pending'
                            ? Wrap(
                                spacing: 4,
                                children: [
                                  IconButton(
                                    tooltip: 'Reject',
                                    onPressed: () async {
                                      Navigator.pop(ctx);
                                      await _decideApplication(app['id'].toString(), 'rejected');
                                    },
                                    icon: const Icon(Icons.close),
                                  ),
                                  IconButton(
                                    tooltip: 'Accept',
                                    onPressed: () async {
                                      Navigator.pop(ctx);
                                      await _decideApplication(app['id'].toString(), 'accepted');
                                    },
                                    icon: const Icon(Icons.check),
                                  ),
                                ],
                              )
                            : null,
                      );
                    }).toList(),
                  ),
          ),
          actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close'))],
        ),
      );
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Server से connection नहीं हो पाया')));
    }
  }

  Future<void> _decideApplication(String applicationId, String status) async {
    try {
      final response = await http.patch(
        Uri.parse('$apiUrl/jobs/applications/$applicationId'),
        headers: AppSession.authHeaders,
        body: jsonEncode({'status': status}),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(response.statusCode >= 200 && response.statusCode < 300
            ? (status == 'accepted' ? 'Worker select हो गया ✅' : 'Application reject हो गई')
            : 'Decision नहीं हो पाया')),
      );
      if (response.statusCode >= 200 && response.statusCode < 300) await _loadMyJobs();
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Server से connection नहीं हो पाया')));
    }
  }

  Widget _buildMyJobsSection() {
    if (_myJobs.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('मेरे Jobs', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              const SizedBox(height: 10),
              ..._myJobs.take(5).map((job) => ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(job['required_skill']?.toString() ?? 'Job'),
                subtitle: Text('${job['location'] ?? 'Location'} · ${job['status'] ?? 'open'}'),
                trailing: OutlinedButton(
                  onPressed: () => _viewApplications(job),
                  child: const Text('Applications'),
                ),
              )),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _createJob() async {
    final skill = TextEditingController();
    final location = TextEditingController();
    final wage = TextEditingController();
    final created = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('नया काम बनाएं'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: skill, decoration: const InputDecoration(labelText: 'Skill', hintText: 'जैसे Electrician')),
            const SizedBox(height: 10),
            TextField(controller: location, decoration: const InputDecoration(labelText: 'Location')),
            const SizedBox(height: 10),
            TextField(controller: wage, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Wage (₹)')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Publish')),
        ],
      ),
    );
    if (created != true) return;
    if (skill.text.trim().isEmpty || location.text.trim().isEmpty) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Skill और location जरूरी हैं')));
      return;
    }
    try {
      final response = await http.post(
        Uri.parse('$apiUrl/jobs'),
        headers: AppSession.authHeaders,
        body: jsonEncode({
          'required_skill': skill.text.trim(),
          'location': location.text.trim(),
          'offered_wage': double.tryParse(wage.text.trim()),
          'duration_days': 1,
        }),
      );
      if (!mounted) return;
      if (response.statusCode >= 200 && response.statusCode < 300) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('काम publish हो गया ✅')));
        await _loadMyJobs();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('काम publish नहीं हो पाया')));
      }
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Server से connection नहीं हो पाया')));
    }
  }

  Future<void> _callWorker(String phone, String name) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.phone_in_talk, color: Color(0xFF3F51B5), size: 26),
            const SizedBox(width: 8),
            Text('Call $name?', style: const TextStyle(fontSize: 18)),
          ],
        ),
        content: Text(
          'AI $name को call करेगी और उनकी skill confirm करेगी।\n\nNumber: $phone',
          style: const TextStyle(fontSize: 14),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: EChowkTheme.navy),
            child: const Text('Call करें!', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final response = await http.post(
        Uri.parse('$apiUrl/voice/call-worker'),
        headers: AppSession.authHeaders,
        body: jsonEncode({'phone': phone}),
      );
      final data = jsonDecode(response.body);
      if (data['success'] == true && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white),
                const SizedBox(width: 8),
                Text('$name को call लगा दी! 📞'),
              ],
            ),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _createJob,
        backgroundColor: EChowkTheme.emerald,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_business_rounded),
        label: const Text('नया काम'),
      ),
      backgroundColor: EChowkTheme.surface,
      body: CustomScrollView(
        slivers: [
          // ─── Gradient AppBar ───────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 160,
            pinned: true,
            backgroundColor: EChowkTheme.navy,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
            actions: [
              IconButton(
                onPressed: _showNotifications,
                icon: Badge(
                  isLabelVisible: _unreadNotifications > 0,
                  label: Text('$_unreadNotifications'),
                  child: const Icon(Icons.notifications_outlined, color: Colors.white),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.refresh, color: Colors.white),
                onPressed: _loadWorkers,
                tooltip: 'Refresh',
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF1A237E), Color(0xFF3F51B5), Color(0xFF5C6BC0)],
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 10, 20, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        const Text('काम देना है?', style: TextStyle(color: Colors.white70, fontSize: 14, letterSpacing: 1)),
                        const SizedBox(height: 4),
                        const Text('Workers ढूंढें', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        // Stats Row
                        Row(
                          children: [
                            _buildStatChip('${_allWorkers.length}', 'Registered'),
                            const SizedBox(width: 8),
                            _buildStatChip(
                              '${_allWorkers.where((w) => w['is_available'] == true).length}',
                              'Available',
                              color: Colors.green,
                            ),
                            const SizedBox(width: 8),
                            _buildStatChip('${_filteredWorkers.length}', 'Filtered'),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          // ─── Search Bar ────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.07), blurRadius: 10)],
                ),
                child: TextField(
                  controller: _searchCtrl,
                  onChanged: (v) { setState(() => _searchQuery = v); _applyFilter(); },
                  decoration: InputDecoration(
                    hintText: 'नाम, Skill, शहर से ढूंढें...',
                    hintStyle: const TextStyle(color: Colors.grey),
                    prefixIcon: const Icon(Icons.search, color: Color(0xFF3F51B5)),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, color: Colors.grey),
                            onPressed: () { _searchCtrl.clear(); setState(() => _searchQuery = ''); _applyFilter(); },
                          )
                        : null,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(child: _buildMyJobsSection()),

          // ─── Skill Filter Chips ────────────────────────────────────────
          SliverToBoxAdapter(
            child: SizedBox(
              height: 52,
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                scrollDirection: Axis.horizontal,
                itemCount: _skills.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (ctx, i) {
                  final skill = _skills[i];
                  final isSelected = _selectedSkill == skill;
                  return GestureDetector(
                    onTap: () { setState(() => _selectedSkill = skill); _applyFilter(); },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF3F51B5) : Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF3F51B5) : Colors.grey.shade300,
                        ),
                        boxShadow: isSelected ? [BoxShadow(color: const Color(0xFF3F51B5).withOpacity(0.3), blurRadius: 8)] : [],
                      ),
                      child: Row(
                        children: [
                          Icon(_skillIcons[skill] ?? Icons.work, size: 15, color: isSelected ? Colors.white : Colors.grey.shade600),
                          const SizedBox(width: 5),
                          Text(skill, style: TextStyle(color: isSelected ? Colors.white : Colors.grey.shade700, fontWeight: FontWeight.w600, fontSize: 13)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          // ─── Workers List ──────────────────────────────────────────────
          _isLoading
              ? const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator(color: Color(0xFF3F51B5))),
                )
              : _filteredWorkers.isEmpty
                  ? SliverFillRemaining(
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.search_off, size: 60, color: Colors.grey.shade400),
                            const SizedBox(height: 16),
                            Text('कोई Worker नहीं मिला', style: TextStyle(color: Colors.grey.shade500, fontSize: 16)),
                            const SizedBox(height: 8),
                            TextButton(onPressed: _loadWorkers, child: const Text('Refresh करें')),
                          ],
                        ),
                      ),
                    )
                  : SliverPadding(
                      padding: const EdgeInsets.all(16),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (ctx, i) => _buildWorkerCard(_filteredWorkers[i]),
                          childCount: _filteredWorkers.length,
                        ),
                      ),
                    ),
        ],
      ),
    );
  }

  Widget _buildWorkerCard(Map<String, dynamic> worker) {
    final name = worker['full_name'] ?? 'Unknown';
    final skill = worker['skill_category'] ?? 'General Labour';
    final city = worker['current_location'] ?? 'Location N/A';
    final phone = worker['phone_number'] ?? '';
    final isAvailable = worker['is_available'] == true;
    final rating = (worker['rating'] ?? 0.0).toDouble();
    final source = worker['registration_source'] ?? 'app';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          // Card Header
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Avatar
                Container(
                  width: 56, height: 56,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: isAvailable
                          ? [const Color(0xFF43A047), const Color(0xFF66BB6A)]
                          : [Colors.grey.shade400, Colors.grey.shade500],
                    ),
                  ),
                  child: Center(
                    child: Text(
                      name.isNotEmpty ? name[0].toUpperCase() : '?',
                      style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17), overflow: TextOverflow.ellipsis),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isAvailable ? Colors.green.shade50 : Colors.grey.shade100,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: isAvailable ? Colors.green : Colors.grey.shade400),
                            ),
                            child: Text(
                              isAvailable ? '✅ Available' : '❌ Busy',
                              style: TextStyle(fontSize: 11, color: isAvailable ? Colors.green.shade700 : Colors.grey, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(_skillIcons[skill] ?? Icons.work, size: 14, color: const Color(0xFF3F51B5)),
                          const SizedBox(width: 4),
                          Text(skill, style: const TextStyle(color: Color(0xFF3F51B5), fontWeight: FontWeight.w600, fontSize: 13)),
                          const SizedBox(width: 10),
                          const Icon(Icons.location_on, size: 14, color: Colors.grey),
                          const SizedBox(width: 2),
                          Expanded(child: Text(city, style: const TextStyle(color: Colors.grey, fontSize: 13), overflow: TextOverflow.ellipsis)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          // Rating stars
                          ...List.generate(5, (i) => Icon(
                            i < rating.floor() ? Icons.star : (i < rating ? Icons.star_half : Icons.star_border),
                            size: 14, color: Colors.amber,
                          )),
                          const SizedBox(width: 4),
                          Text('$rating', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                          const SizedBox(width: 8),
                          // Registration badge
                          if (source == 'voice')
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: const Color(0xFFE8EAF6), borderRadius: BorderRadius.circular(6)),
                              child: const Text('🎤 Voice', style: TextStyle(fontSize: 10, color: Color(0xFF3F51B5))),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Action Buttons
          Container(
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(20), bottomRight: Radius.circular(20)),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.info_outline, size: 16),
                    label: const Text('Profile'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF3F51B5),
                      side: const BorderSide(color: Color(0xFF3F51B5)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: ElevatedButton.icon(
                    onPressed: phone.isNotEmpty ? () => _callWorker(phone, name) : null,
                    icon: const Icon(Icons.phone, size: 16),
                    label: const Text('AI Call करें', style: TextStyle(fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF3F51B5),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatChip(String value, String label, {Color color = Colors.white}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Row(
        children: [
          Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(color: color.withOpacity(0.8), fontSize: 11)),
        ],
      ),
    );
  }
}
