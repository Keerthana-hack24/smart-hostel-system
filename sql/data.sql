USE smart_hostel;

INSERT INTO Rooms(room_number, floor, block)
VALUES 
('A101',1,'A'),
('A102',1,'A'),
('B201',2,'B'),
('B202',2,'B');

-- =====================================
-- STUDENTS
-- =====================================

INSERT INTO Students(name,email,phone,room_id,password,nickname)
VALUES
('Akshara','ak@gmail.com','9876543210',1,'pass123','ak'),
('Rahul','rahul@gmail.com','9876543211',2,'pass123','rah'),
('Sneha','sneha@gmail.com','9876543212',3,'pass123','sne');

-- =====================================
-- LAUNDRY MACHINES
-- =====================================

INSERT INTO Laundry_Machines(type,location,status)
VALUES
('Washer','Block A','Available'),
('Dryer','Block A','Available'),
('Washer','Block B','Maintenance');

-- =====================================
-- LAUNDRY USAGE
-- =====================================

CALL StartLaundry(1, 1, 45);

-- =====================================
-- COMPLAINT CATEGORIES
-- =====================================

INSERT INTO Complaint_Category(category_name)
VALUES
('Electrical'),
('Plumbing'),
('Furniture'),
('Internet'),
('Cleaning'),
('Catering'),
('Vending Machine'),
('Other');

-- =====================================
-- COMPLAINTS
-- =====================================

INSERT INTO Complaints(
    student_id,
    category_id,
    description,
    status,
    priority
)
VALUES
(1,1,'Tube light not working','Pending','High'),
(2,2,'Water leakage in bathroom','Assigned','Medium'),
(3,4,'WiFi not working properly','In Progress','High');

-- =====================================
-- STAFF
-- =====================================

INSERT INTO Staff(name,email,phone,specialization,password)
VALUES
('Ravi Electrician','electrician@hostel.com','0500000001','Electrical','staff123'),
('Amit Plumber','plumber@hostel.com','0500000002','Plumbing','staff123'),
('Sara Cleaner','cleaning@hostel.com','0500000003','Cleaning','staff123');

-- =====================================
-- ADMIN
-- =====================================

INSERT INTO Admin(name,email,password)
VALUES ('Hostel Warden','admin@hostel.com','admin123');

-- =====================================
-- ASSIGNMENTS
-- =====================================

INSERT INTO Assignments(complaint_id,'staff_id')
VALUES (2,2);

-- =====================================
-- FEEDBACK
-- =====================================

INSERT INTO Feedback(complaint_id,student_id,rating,comments)
VALUES(2,2,5,'Issue resolved quickly');