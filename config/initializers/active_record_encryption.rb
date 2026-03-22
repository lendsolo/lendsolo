Rails.application.config.active_record.encryption.primary_key = ENV.fetch("ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY", "vI4drqiD2BLUwi5fgXUS6D6riHdl0Bm5")
Rails.application.config.active_record.encryption.deterministic_key = ENV.fetch("ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY", "NcjEIOD6Q9uXnAwVqtP5eZXzHvkOb7xV")
Rails.application.config.active_record.encryption.key_derivation_salt = ENV.fetch("ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT", "wQccXlCMavKg2y0vTUqdSxnlCkhmiUeM")
