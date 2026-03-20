class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :loans, dependent: :destroy
  has_many :expenses, dependent: :destroy
end
