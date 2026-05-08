CREATE DATABASE smart_hostel;
USE smart_hostel;

-- Akshara:
CREATE TABLE Rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(10),
    floor INT,
    block VARCHAR(10)
);

CREATE TABLE Students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) not NULL UNIQUE,
    phone VARCHAR(15),
    room_id INT,
    password VARCHAR(100),
    nickname VARCHAR(50),
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id)
);

CREATE TABLE Laundry_Machines (
    machine_id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(20), -- Washer / Dryer
    location VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('Available','In Use','Maintenance'))
);
CREATE TABLE Laundry_Usage (
    usage_id INT PRIMARY KEY AUTO_INCREMENT,
    machine_id INT,
    student_id INT,
    start_time DATETIME,
    end_time DATETIME,
    status VARCHAR(20) CHECK (status IN ('Running','Completed')),
    FOREIGN KEY (machine_id) REFERENCES Laundry_Machines(machine_id),
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

-- laundry
DELIMITER //

CREATE PROCEDURE StartLaundry(
    IN p_machine_id INT,
    IN p_student_id INT,
    IN p_duration INT
)
BEGIN
    DECLARE machine_status VARCHAR(20);

    -- Check machine availability
    SELECT status INTO machine_status
    FROM Laundry_Machines
    WHERE machine_id = p_machine_id;

    IF machine_status = 'Available' THEN

        -- Insert usage
        INSERT INTO Laundry_Usage(machine_id, student_id, start_time, end_time, status)
        VALUES (
            p_machine_id,
            p_student_id,
            NOW(),
            DATE_ADD(NOW(), INTERVAL p_duration MINUTE),
            'Running'
        );

        -- Update machine
        UPDATE Laundry_Machines
        SET status = 'In Use'
        WHERE machine_id = p_machine_id;

    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Machine is not available';
    END IF;

END//

DELIMITER ;
 -- completed and available
 DELIMITER //

CREATE PROCEDURE CompleteLaundry(IN p_usage_id INT)
BEGIN
    DECLARE m_id INT;

    -- Get machine id
    SELECT machine_id INTO m_id
    FROM Laundry_Usage
    WHERE usage_id = p_usage_id;

    -- Update usage
    UPDATE Laundry_Usage
    SET status = 'Completed'
    WHERE usage_id = p_usage_id;

    -- Free machine
    UPDATE Laundry_Machines
    SET status = 'Available'
    WHERE machine_id = m_id;

END//

DELIMITER ;

-- running laundry
CREATE VIEW Running_Laundry AS
SELECT 
    s.name,
    l.machine_id,
    l.start_time,
    l.end_time
FROM Laundry_Usage l
JOIN Students s ON l.student_id = s.student_id
WHERE l.status = 'Running';
 
-- view available
CREATE VIEW Available_Machines AS
SELECT *
FROM Laundry_Machines
WHERE status = 'Available';

UPDATE Laundry_Machines lm
JOIN Laundry_Usage lu ON lm.machine_id = lu.machine_id
SET lm.status = 'In Use'
WHERE lu.status = 'Running';

-- Kumarini:
CREATE TABLE Complaint_Category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(80) NOT NULL UNIQUE,
    Is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE Complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    category_id INT NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Pending','Assigned','In Progress','Resolved') NOT NULL DEFAULT 'Pending',
    priority ENUM('Low','Medium','High') NOT NULL DEFAULT 'Medium',
    date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_date TIMESTAMP NULL,
    resolution_remarks TEXT,
 
    CONSTRAINT fk_complaint_student
    FOREIGN KEY (student_id)  REFERENCES Students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_category
    FOREIGN KEY (category_id) REFERENCES Complaint_Category(category_id)
);


CREATE TABLE Complaint_Attachments (
    attachment_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id  INT NOT NULL,
    file_path     VARCHAR(500) NOT NULL,
    uploaded_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
 
    CONSTRAINT fk_attach_complaint
    FOREIGN KEY (complaint_id) REFERENCES Complaints(complaint_id) ON DELETE CASCADE
);

-- Keerthana:
CREATE TABLE Staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    specialization VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fixed: removed assigned_by_admin_id column
CREATE TABLE Assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    staff_id INT NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES Complaints(complaint_id),
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id),
    UNIQUE KEY unique_active_assignment (complaint_id)
);

CREATE TABLE Feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    student_id INT NOT NULL,
    rating INT NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES Complaints(complaint_id),
    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    UNIQUE KEY one_feedback_per_complaint (complaint_id, student_id),
    CHECK (rating BETWEEN 1 AND 5)
);

-- Indexes
CREATE INDEX idx_staff_specialization ON Staff(specialization);
CREATE INDEX idx_complaints_status ON Complaints(status);
CREATE INDEX idx_complaints_priority ON Complaints(priority);
CREATE INDEX idx_complaints_date ON Complaints(date_submitted);
CREATE INDEX idx_assignments_staff ON Assignments(staff_id);
CREATE INDEX idx_feedback_rating ON Feedback(rating);

DELIMITER //

-- Fixed: removed history insert here (let the after-update trigger handle it)
CREATE TRIGGER trg_assignment_sets_complaint_assigned
AFTER INSERT ON Assignments
FOR EACH ROW
BEGIN
    UPDATE Complaints
    SET status = 'Assigned'
    WHERE complaint_id = NEW.complaint_id
      AND status = 'Pending';
END//

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_complaint_resolved_date
BEFORE UPDATE ON Complaints
FOR EACH ROW
BEGIN
    IF NEW.status = 'Resolved' AND OLD.status <> 'Resolved' THEN
        SET NEW.resolved_date = CURRENT_TIMESTAMP;
    END IF;
END//

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_feedback_only_after_resolved
BEFORE INSERT ON Feedback
FOR EACH ROW
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM Complaints
        WHERE complaint_id = NEW.complaint_id
          AND student_id = NEW.student_id
          AND status = 'Resolved'
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Feedback can be added only after the complaint is resolved by the same student';
    END IF;
END//

DELIMITER ;

-- Roles
CREATE ROLE hostel_admin_role;
CREATE ROLE hostel_staff_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON smart_hostel.* TO hostel_admin_role;
GRANT SELECT ON smart_hostel.Complaints TO hostel_staff_role;
GRANT SELECT ON smart_hostel.Assignments TO hostel_staff_role;
GRANT SELECT ON smart_hostel.Staff TO hostel_staff_role;
GRANT UPDATE (status, resolution_remarks) ON smart_hostel.Complaints TO hostel_staff_role;