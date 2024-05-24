
DELIMITER //

CREATE PROCEDURE truncate_all_tables()
BEGIN
	DECLARE done INT DEFAULT 0;
	DECLARE tableName VARCHAR(255);

    -- Generate SQL statements to truncate all tables
    DECLARE cur CURSOR FOR 
    
    SELECT CONCAT('TRUNCATE TABLE ', table_schema, '.', table_name)
    FROM information_schema.tables
    WHERE table_type = 'BASE TABLE'
    AND table_schema = DATABASE()
    AND table_name NOT IN (SELECT table_name FROM information_schema.views WHERE table_schema = DATABASE());

-- Error handling
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
-- Open cursor
OPEN cur;

-- Loop through tables and truncate
read_loop: LOOP
	SET FOREIGN_KEY_CHECKS = 0;
    
    FETCH cur INTO tableName;
    
    IF done THEN
        LEAVE read_loop;
    END IF;
    SET @stmt = tableName;
    PREPARE stmt FROM @stmt;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    SET FOREIGN_KEY_CHECKS = 1;
END LOOP;

-- Close cursor
CLOSE cur;
	
    
END //

DELIMITER ;