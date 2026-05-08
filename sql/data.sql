USE smart_hostel;

INSERT INTO Rooms (room_number, floor, block) VALUES
('A101', 1, 'A'),
('A102', 1, 'A'),
('A103', 1, 'A'),
('B201', 2, 'B'),
('B202', 2, 'B'),
('B203', 2, 'B'),
('C301', 3, 'C'),
('C302', 3, 'C'),
('C303', 3, 'C'),
('D401', 4, 'D');

INSERT INTO Students (name, email, phone, room_id, password, nickname) VALUES
('Aarav Sharma', 'aarav@example.com', '9876543210', 1, 'pass123', 'aarav_07'),
('Vivaan Gupta', 'vivaan@example.com', '9876543211', 2, 'pass123', 'vivi'),
('Aditya Singh', 'aditya@example.com', '9876543212', 3, 'pass123', 'adi'),
('Vihaan Kumar', 'vihaan@example.com', '9876543213', 4, 'pass123', 'vihan'),
('Arjun Reddy', 'arjun@example.com', '9876543214', 5, 'pass123', 'arjun_r'),
('Sai Patel', 'sai@example.com', '9876543215', 6, 'pass123', 'sai_p'),
('Ananya Nair', 'ananya@example.com', '9876543216', 7, 'pass123', 'anu'),
('Iyer Priya', 'priya@example.com', '9876543217', 8, 'pass123', 'priya_i'),
('Divya Menon', 'divya@example.com', '9876543218', 9, 'pass123', 'div'),
('Karthik Raj', 'karthik@example.com', '9876543219', 10, 'pass123', 'karthik');

INSERT INTO Laundry_Machines (type, location, status) VALUES
('Washer', 'Block A - Ground Floor', 'Available'),
('Dryer', 'Block A - Ground Floor', 'Available'),
('Washer', 'Block B - First Floor', 'Available'),
('Dryer', 'Block B - First Floor', 'Available'),
('Washer', 'Block C - Second Floor', 'Maintenance'),
('Dryer', 'Block C - Second Floor', 'Available'),
('Washer', 'Block D - Ground Floor', 'Available'),
('Dryer', 'Block D - Ground Floor', 'Available'),
('Washer', 'Block E - First Floor', 'Available'),
('Dryer', 'Block E - First Floor', 'Available');


INSERT INTO Complaint_Category (category_name) VALUES ('Electrical'),('Plumbing'),('Furniture'),('Internet'),('Cleaning'),('Catering'),('Vending machine'),('Other');
INSERT INTO Complaint_Category (category_name) VALUES ('AC Repair'), ('Pest Control');

INSERT INTO Complaints (student_id, category_id, description, status, priority, date_submitted, resolved_date, resolution_remarks) VALUES
(1, 1, 'Light flickering in room', 'Resolved', 'Medium', '2025-04-01 10:00:00', '2025-04-03 14:00:00', 'Replaced tube light'),
(2, 2, 'Leaking tap in washroom', 'In Progress', 'High', '2025-04-02 09:30:00', NULL, NULL),
(3, 3, 'Broken chair', 'Pending', 'Low', '2025-04-03 11:15:00', NULL, NULL),
(4, 4, 'Wi-Fi not working', 'Assigned', 'High', '2025-04-04 08:45:00', NULL, NULL),
(5, 5, 'Dustbin not cleaned', 'Resolved', 'Medium', '2025-04-05 14:20:00', '2025-04-06 10:00:00', 'Cleaned daily now'),
(6, 6, 'Food quality issue', 'In Progress', 'High', '2025-04-06 19:00:00', NULL, NULL),
(7, 7, 'Vending machine out of stock', 'Pending', 'Low', '2025-04-07 12:30:00', NULL, NULL),
(8, 8, 'No hot water', 'Assigned', 'Medium', '2025-04-08 07:00:00', NULL, NULL),
(9, 9, 'AC not cooling', 'Pending', 'High', '2025-04-09 16:00:00', NULL, NULL),
(10, 10, 'Cockroach in room', 'Resolved', 'Medium', '2025-04-10 09:00:00', '2025-04-11 11:30:00', 'Pest control done');

INSERT INTO Staff (name, email, phone, specialization, password, is_active) VALUES
('Ravi', 'ravi.elec@hostel.com', '9000000001', 'Electrical', 'staff123', TRUE),
('Amit', 'amit.plumb@hostel.com', '9000000002', 'Plumbing', 'staff123', TRUE),
('Sara', 'sara.clean@hostel.com', '9000000003', 'Cleaning', 'staff123', TRUE),
('Kiran', 'kiran.carp@hostel.com', '9000000004', 'Furniture', 'staff123', TRUE),
('John', 'john.it@hostel.com', '9000000005', 'Internet', 'staff123', TRUE),
('Meera', 'meera.ac@hostel.com', '9000000006', 'AC Repair', 'staff123', TRUE),
('Rahul', 'rahul.pest@hostel.com', '9000000007', 'Pest Control', 'staff123', TRUE),
('Neha', 'neha.cater@hostel.com', '9000000008', 'Catering', 'staff123', TRUE),
('Vijay', 'vijay.vend@hostel.com', '9000000009', 'Vending machine', 'staff123', TRUE),
('Deepak', 'deepak.gen@hostel.com', '9000000010', 'Other', 'staff123', TRUE);
select * from Staff;
INSERT INTO Admin (name, email, password) VALUES
('Hostel Warden', 'warden@hostel.com', 'admin123'),
('Deputy Warden', 'deputy@hostel.com', 'admin123');

INSERT INTO Assignments (complaint_id, staff_id, assigned_date) VALUES
(1, 1, '2025-04-02 09:00:00'),
(2, 2, '2025-04-02 10:00:00'),
(3, 4, '2025-04-03 12:00:00'),
(4, 5, '2025-04-04 09:00:00'),
(5, 3, '2025-04-05 15:00:00'),
(6, 8, '2025-04-06 20:00:00'),
(7, 9, '2025-04-07 13:00:00'),
(9, 6, '2025-04-09 17:00:00'),
(10, 7, '2025-04-10 10:00:00');

