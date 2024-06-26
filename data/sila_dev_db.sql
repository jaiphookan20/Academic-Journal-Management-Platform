-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: localhost    Database: sila_dev_db
-- ------------------------------------------------------
-- Server version	8.0.36-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `client_role`
--

DROP TABLE IF EXISTS `client_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_role` (
  `client_role_id` int NOT NULL AUTO_INCREMENT,
  `client_id` int DEFAULT NULL COMMENT 'DELETE CASCADE: If a client is deleted, their roles can be deleted',
  `role_id` int DEFAULT NULL COMMENT 'DELETE NO ACTION: Restricts the deletion of roles',
  `assigned_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`client_role_id`),
  KEY `client_id` (`client_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `client_role_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`) ON DELETE CASCADE,
  CONSTRAINT `client_role_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1004 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_role`
--

LOCK TABLES `client_role` WRITE;
/*!40000 ALTER TABLE `client_role` DISABLE KEYS */;
INSERT INTO `client_role` VALUES (1000,1,1,'2024-03-27 00:55:12',NULL),(1001,3,3,'2024-03-27 00:55:12',NULL),(1002,3,4,'2024-03-27 00:55:12',NULL),(1003,2,2,'2024-03-27 00:55:12',NULL);
/*!40000 ALTER TABLE `client_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `client_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT 'username needed for login',
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL DEFAULT '',
  `orcid` varchar(30) DEFAULT NULL,
  `institution_name` varchar(100) DEFAULT NULL,
  `pronoun` enum('he/him','she/her','they/them','other') DEFAULT 'other',
  `salt` varchar(255) NOT NULL COMMENT 'static salt for the given client',
  `password_hash` varchar(255) NOT NULL COMMENT 'password hash generated by combining password and static salt through hashing function',
  `verification_token` varchar(255) DEFAULT NULL COMMENT 'Verification token',
  `email_verified` tinyint(1) DEFAULT '0' COMMENT 'whether the email has been verified by the use yet, 0 if false, 1 if true',
  `reset_token` varchar(255) DEFAULT NULL COMMENT 'password reset token',
  `reset_token_expiry` timestamp NULL DEFAULT NULL COMMENT 'password reset token expiry time',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'timestamp when the client was created',
  `last_login` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`client_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,'rssriv@student.unimelb.edu.au','Rishabh','Srivastava','rssriv@student.unimelb.edu.au',NULL,NULL,'other','static_salt_1','hashed_password_1',NULL,1,NULL,NULL,'2024-03-25 10:20:39','2024-03-25 10:20:39'),(2,'szingade@student.unimelb.edu.au','Saurabh','Zingade','szingade@student.unimelb.edu.au',NULL,NULL,'other','static_salt_2','hashed_password_2',NULL,0,NULL,NULL,'2024-03-25 10:20:39','2024-03-25 10:20:39'),(3,'xiyanedwinz@student.unimelb.edu.au','Edwin','Zhu','xiyanedwinz@student.unimelb.edu.au',NULL,NULL,'other','static_salt_3','hashed_password_3',NULL,0,NULL,NULL,'2024-03-25 10:20:39','2024-03-25 10:20:39');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `files` (
  `file_id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int DEFAULT NULL COMMENT 'DELETE CASCADE: If the submission is deleted, associated files can and should be deleted',
  `file_description` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL DEFAULT 'data/manuscripts/',
  `file_upload_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`file_id`),
  KEY `files_ibfk_1` (`submission_id`),
  CONSTRAINT `files_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`submission_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files`
--

LOCK TABLES `files` WRITE;
/*!40000 ALTER TABLE `files` DISABLE KEYS */;
INSERT INTO `files` VALUES (100,1,'Main file submission','data/manuscript/file1.pdf','2024-03-27 03:25:47'),(101,2,'supporting file','data/manuscript/file2.pdf','2024-03-27 03:25:51');
/*!40000 ALTER TABLE `files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manuscript_comments`
--

DROP TABLE IF EXISTS `manuscript_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manuscript_comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `file_id` int DEFAULT NULL,
  `comments` text,
  `commented_by` int DEFAULT NULL COMMENT 'DELETE SET NULL: if a client is deleted, associated reviews can still be useful, keep',
  `comment_upload_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `visible_to_author` tinyint(1) DEFAULT 0 COMMENT '1 to show comments to author',
  PRIMARY KEY (`comment_id`),
  KEY `manuscript_comments_ibfk_1` (`file_id`),
  KEY `manuscript_comments_ibfk_2` (`commented_by`),
  CONSTRAINT `manuscript_comments_ibfk_1` FOREIGN KEY (`file_id`) REFERENCES `files` (`file_id`) ON DELETE CASCADE,
  CONSTRAINT `manuscript_comments_ibfk_2` FOREIGN KEY (`commented_by`) REFERENCES `clients` (`client_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manuscript_comments`
--

LOCK TABLES `manuscript_comments` WRITE;
/*!40000 ALTER TABLE `manuscript_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `manuscript_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `outcomes`
--

DROP TABLE IF EXISTS `outcomes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `outcomes` (
  `outcome_id` int NOT NULL AUTO_INCREMENT,
  `outcome_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`outcome_id`),
  UNIQUE KEY `outcome_name` (`outcome_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `outcomes`
--

LOCK TABLES `outcomes` WRITE;
/*!40000 ALTER TABLE `outcomes` DISABLE KEYS */;
INSERT INTO `outcomes` VALUES (1,'accept','This article is suitable for publication.'),(2,'revise','This article is potentially suitable for publication, but requires considerable revision as specified in the comments below.'),(3,'reject','This article is not recommended for publication.'),(4,'accept with minor revisions','This article is suitable for publication in its present form, provided that minor corrections or revisions are made as specified in the comments below.'),(5,'desk reject','The submission is rejected without external peer review.');
/*!40000 ALTER TABLE `outcomes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `token_id` int NOT NULL AUTO_INCREMENT,
  `refresh_token` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `client_id` int NOT NULL COMMENT 'DELETE CASCADE: If the client is deleted, refresh token is not needed',
  `valid_from` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `valid_till` timestamp GENERATED ALWAYS AS ((`valid_from` + interval 7 day)) VIRTUAL NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `revoked_by` int DEFAULT NULL COMMENT 'DELETE SET NULL: If a parent foreign key is deleted, its children are still kept',
  PRIMARY KEY (`token_id`),
  KEY `client_id` (`client_id`),
  KEY `revoked_by` (`revoked_by`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`) ON DELETE CASCADE,
  CONSTRAINT `refresh_tokens_ibfk_2` FOREIGN KEY (`revoked_by`) REFERENCES `refresh_tokens` (`token_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int DEFAULT NULL COMMENT 'DELETE CASCADE: If a submission is deleted, associated reviews can be deleted, assuming that they are already published or rejected',
  `reviewer_id` int DEFAULT NULL COMMENT 'DELETE SET NULL: if a client is deleted, associated reviews can still be useful, keep',
  `confirm_to_editor` tinyint(1) DEFAULT NULL COMMENT '1 for the reviewer agreeing to review a submission and 0 otherwise',
  `outcome_recommendation` int DEFAULT NULL COMMENT 'DELETE NO ACTION: restricts the deletion of outcomes',
  `target_date` date DEFAULT NULL,
  `revision_review` tinyint(1) DEFAULT NULL COMMENT '1 if the reviewer is willing to review revisions, 0 if not',
  `review_comments_editor` text COMMENT 'Comments left by the reviewer to the editor',
  `review_comments_author` text COMMENT 'Comments left by the reviewer to the author',
  `review_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `submission_id` (`submission_id`),
  KEY `reviewer_id` (`reviewer_id`),
  KEY `reviews_ibfk_3` (`outcome_recommendation`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`submission_id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `clients` (`client_id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`outcome_recommendation`) REFERENCES `outcomes` (`outcome_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,3,NULL,2,'2024-03-26',1,'Author needs to cite more articles.','This looks great.\nBut it needs a bit of work.\n		Testing tab space','2024-03-27 12:40:43'),(2,2,3,NULL,3,'2024-04-10',1,'This article is not relevant to the paper','This is well written, but not that relevant to the topic unfortunately.','2024-04-11 11:21:32');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (3,'Author'),(1,'Editor'),(2,'Editorial Assistant'),(4,'Reviewer');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submission_access`
--

DROP TABLE IF EXISTS `submission_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submission_access` (
  `access_id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int DEFAULT NULL,
  `client_role_id` int NOT NULL,
  `access_token` varchar(255) NOT NULL,
  `valid_from` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `valid_till` timestamp GENERATED ALWAYS AS ((`valid_from` + interval 5 minute)) VIRTUAL NULL,
  PRIMARY KEY (`access_id`),
  KEY `submission_id` (`submission_id`),
  KEY `client_role_id` (`client_role_id`),
  CONSTRAINT `submission_access_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`submission_id`) ON DELETE CASCADE,
  CONSTRAINT `submission_access_ibfk_2` FOREIGN KEY (`client_role_id`) REFERENCES `client_role` (`client_role_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submission_access`
--

LOCK TABLES `submission_access` WRITE;
/*!40000 ALTER TABLE `submission_access` DISABLE KEYS */;
/*!40000 ALTER TABLE `submission_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissions` (
  `submission_id` int NOT NULL AUTO_INCREMENT,
  `author_id` int DEFAULT NULL COMMENT 'DELETE CASCADE: If an author is deleted, their submissions are no longer needed',
  `editor_id` int DEFAULT NULL COMMENT 'DELETE SET NULL: If an editor is removed, set to null/no editor is in charge of this submission',
  `submission_title` varchar(255) NOT NULL,
  `parent_submission_id` int DEFAULT NULL COMMENT 'DELETE NO ACTION: We don''t provide deletion of submissions',
  `submission_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `submission_type` varchar(255) DEFAULT NULL,
  `abstract` text NOT NULL,
  `acknowledgements` text,
  `conflict_of_interest` varchar(255) DEFAULT NULL,
  `authors` varchar(510) DEFAULT NULL,
  `outcome_id` int DEFAULT NULL COMMENT 'DELETE NO ACTION: Restricts the deletion of outcomes',
  `status` enum('Under Primary Review','Under Secondary Review','Submitted','Review Completed','Outcome Published') DEFAULT 'Under Primary Review',
  `comments_to_author` text DEFAULT NULL COMMENT 'Comments to pass to the author',
  PRIMARY KEY (`submission_id`),
  KEY `author_id` (`author_id`),
  KEY `parent_submission_id` (`parent_submission_id`),
  KEY `outcome_id` (`outcome_id`),
  KEY `submissions_ibfk_4` (`editor_id`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `clients` (`client_id`) ON DELETE CASCADE,
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`parent_submission_id`) REFERENCES `submissions` (`submission_id`),
  CONSTRAINT `submissions_ibfk_3` FOREIGN KEY (`outcome_id`) REFERENCES `outcomes` (`outcome_id`),
  CONSTRAINT `submissions_ibfk_4` FOREIGN KEY (`editor_id`) REFERENCES `clients` (`client_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES (1,3,1,'paper1',NULL,'2024-03-26 15:55:12','normal','this is a good paper about stuff.','Acknowledgements1','Conflict of interest with someone.','James Clark, Eric Johnson',NULL,'Under Primary Review',NULL),(2,3,1,'paper2',NULL,'2024-03-19 17:55:12','normal','this is a paper about technology.','Acknowledgements2',NULL,'James Clark',1,'Under Primary Review',NULL);
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-05-12 18:27:26
