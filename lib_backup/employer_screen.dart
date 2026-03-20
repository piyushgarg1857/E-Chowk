import 'package:flutter/material.dart';

class EmployerScreen extends StatefulWidget {
  const EmployerScreen({Key? key}) : super(key: key);

  @override
  State<EmployerScreen> createState() => _EmployerScreenState();
}

class _EmployerScreenState extends State<EmployerScreen> {
  final List<Map<String, dynamic>> workers = [
    {'name': 'Worker 1: RAJU', 'rating': 4.5, 'skill': 'मजदूरी (Mazdoori)', 'distance': '2.5 KM away', 'avatar': 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'},
    {'name': 'Worker 2: SURESH', 'rating': 4.8, 'skill': 'Plumber', 'distance': '3.1 KM away', 'avatar': 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'},
    {'name': 'Worker 3: MANOJ', 'rating': 4.2, 'skill': 'Driver', 'distance': '1.5 KM away', 'avatar': 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA), // Light background
      appBar: AppBar(
        title: const Text('Hire Workers Instantly'),
        backgroundColor: const Color(0xFF3F51B5),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Search Bar
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 5))
                  ],
                ),
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Search Skill, Location...',
                    prefixIcon: const Icon(Icons.search, color: Colors.grey),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: BorderSide.none),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              
              // Skills Grid
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 3,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 0.9,
                children: [
                  _buildSkillIcon(context, 'MAZDOOR\n(LABOUR)', Icons.engineering),
                  _buildSkillIcon(context, 'DRIVER', Icons.drive_eta),
                  _buildSkillIcon(context, 'HELPER', Icons.handshake),
                  _buildSkillIcon(context, 'PLUMBER', Icons.plumbing),
                  _buildSkillIcon(context, 'ELECTRICIAN', Icons.electrical_services),
                  _buildSkillIcon(context, 'LIST ALL', Icons.list_alt),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // Dropdowns Area
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                child: Column(
                  children: [
                    _buildDropdown('Select Skill', ['Mazdoor', 'Driver', 'Plumber']),
                    const SizedBox(height: 10),
                    _buildDropdown('Duration (e.g., 1 Day)', ['1 Day', '2 Days', '1 Week']),
                    const SizedBox(height: 10),
                    _buildDropdown('Location', ['Current Location', 'Delhi', 'Mumbai']),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {},
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF3F51B5),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                        ),
                        child: const Text('FIND WORKERS', style: TextStyle(fontSize: 16, color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 30),
              const Text('Matching List (Nearby)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF3F51B5))),
              const SizedBox(height: 16),
              
              // Markers List / Matching Workers List
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: workers.length,
                itemBuilder: (context, index) {
                  final worker = workers[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 5)),
                      ],
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 30,
                          backgroundColor: const Color(0xFFE8EAF6),
                          backgroundImage: NetworkImage(worker['avatar']),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('${worker['name']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.star, color: Colors.amber, size: 16),
                                  const SizedBox(width: 4),
                                  Text('${worker['rating']}', style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text('Skill: ${worker['skill']}', style: const TextStyle(color: Colors.black87, fontSize: 13)),
                              const SizedBox(height: 2),
                              Text('Location: ${worker['distance']}', style: const TextStyle(color: Colors.black54, fontSize: 13)),
                            ],
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF3F51B5),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                          child: const Text('BOOK NOW', style: TextStyle(color: Colors.white, fontSize: 12)),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSkillIcon(BuildContext context, String title, IconData icon) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 36, color: Colors.grey.shade700),
          const SizedBox(height: 8),
          Text(title, textAlign: TextAlign.center, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black87)),
        ],
      ),
    );
  }

  Widget _buildDropdown(String hint, List<String> items) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(8),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          isExpanded: true,
          hint: Text(hint, style: TextStyle(color: Colors.grey.shade600)),
          items: items.map((String value) {
            return DropdownMenuItem<String>(
              value: value,
              child: Text(value),
            );
          }).toList(),
          onChanged: (_) {},
        ),
      ),
    );
  }
}
