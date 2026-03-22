class RenameTinCiphertextToTinInBorrowers < ActiveRecord::Migration[8.0]
  def change
    rename_column :borrowers, :tin_ciphertext, :tin if column_exists?(:borrowers, :tin_ciphertext)
  end
end
