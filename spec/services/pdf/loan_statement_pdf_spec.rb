require "rails_helper"

RSpec.describe Pdf::LoanStatementPdf do
  let(:user) { create(:user, business_name: "Test Lending") }
  let(:loan) { create(:loan, user: user, principal: 50_000, annual_rate: 10, term_months: 12) }

  before do
    create(:payment, loan: loan, amount: loan.monthly_payment, date: loan.start_date + 1.month)
  end

  it "renders a PDF without error" do
    pdf = described_class.new(loan, user)
    result = pdf.render
    expect(result).to be_a(Prawn::Document)
    rendered = result.render
    expect(rendered).to be_a(String)
    expect(rendered.bytes.first(4)).to eq("%PDF".bytes)
  end
end
