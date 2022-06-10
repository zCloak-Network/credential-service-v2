/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50737
 Source Host           : localhost:3306
 Source Schema         : zkID-service2

 Target Server Type    : MySQL
 Target Server Version : 50737
 File Encoding         : 65001

 Date: 08/06/2022 10:18:46
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

--claim queue

-- ----------------------------
-- Table structure for claim
-- ----------------------------
DROP TABLE IF EXISTS `claim`;
CREATE TABLE `claim` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `create_time` datetime NOT NULL COMMENT 'create time',
  `update_time` datetime NOT NULL COMMENT 'last update time',
  `root_hash` varchar(255) NOT NULL COMMENT 'claim rootHash',
  `nonce` varchar(255) NOT NULL COMMENT 'kilt nonce',
  `sender_key_id` varchar(255) NOT NULL COMMENT 'the keyId of sender ',
  `receiver_key_id` varchar(255) NOT NULL COMMENT 'the keyId of receiver',
  `ciphertext` text NOT NULL COMMENT 'encrypted text',
  `attested_status` tinyint(4) NOT NULL COMMENT 'attested status',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for claim_queue
-- ----------------------------
DROP TABLE IF EXISTS `claim_queue`;
CREATE TABLE `claim_queue` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `create_time` datetime NOT NULL COMMENT 'create time',
  `update_time` datetime NOT NULL COMMENT 'last update time',
  `root_hash` varchar(255) NOT NULL COMMENT 'claim rootHash',
  `is_delete` tinyint(3) unsigned NOT NULL COMMENT 'whether to delete',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;