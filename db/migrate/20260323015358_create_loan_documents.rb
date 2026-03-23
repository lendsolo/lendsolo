class CreateLoanDocuments < ActiveRecord::Migration[8.0]
  def change
    create_table :loan_documents do |t|
      t.references :loan, null: false, foreign_key: true
      t.string :document_type, null: false
      t.string :status, null: false, default: "missing"
      t.text :notes
      t.timestamps
    end

    add_index :loan_documents, [:loan_id, :document_type], unique: true

    # Backfill existing loans with 5 missing document records each
    reversible do |dir|
      dir.up do
        execute <<~SQL
          INSERT INTO loan_documents (loan_id, document_type, status, created_at, updated_at)
          SELECT l.id, dt.document_type, 'missing', NOW(), NOW()
          FROM loans l
          CROSS JOIN (
            VALUES ('promissory_note'), ('deed_of_trust'), ('title_insurance'), ('hazard_insurance'), ('personal_guarantee')
          ) AS dt(document_type)
        SQL
      end
    end
  end
end
