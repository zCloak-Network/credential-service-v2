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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- 2022-06-14 fix create_time
ALTER TABLE claim MODIFY COLUMN create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'create time';
ALTER TABLE claim_queue MODIFY COLUMN create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'create time';

-- 2022-06-14 fix update_time
ALTER TABLE claim MODIFY COLUMN update_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'update time'
ALTER TABLE claim_queue MODIFY COLUMN update_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'update time'

-- 2022-06-15 adapt message
ALTER TABLE claim MODIFY COLUMN root_hash varchar(255) NULL COMMENT "credential's rootHash"
ALTER TABLE claim MODIFY COLUMN attested_status tinyint unsigned NULL COMMENT "attested status"

-- 2022-07-12 adapt message
ALTER TABLE claim ADD COLUMN receiver_address varchar(255) NULL COMMENT "receiver address";
ALTER TABLE claim ADD COLUMN sender_address varchar(255) NULL COMMENT "sender address";

-- 2022-07-19 migrate data to mysql
DROP TABLE IF EXISTS `row_scan_ctype`;
CREATE TABLE `row_scan_ctype` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `metadata` json NOT NULL,
  `ctype_hash` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `faucet_transfer`;
CREATE TABLE `faucet_transfer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `address_from` varchar(255) NOT NULL,
  `address_to` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `timestamp` bigint(20) unsigned NOT NULL,
  `transfer_status` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `row_scan_ctype`;
CREATE TABLE `ctype` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `metadata` json NOT NULL,
  `ctype_hash` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2022-07-12 adapt message
ALTER TABLE ctype ADD COLUMN description varchar(255) NULL COMMENT "ctype description";
