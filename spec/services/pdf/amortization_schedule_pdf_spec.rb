require "rails_helper"

RSpec.describe Pdf::AmortizationSchedulePdf do
  let(:user) { create(:user, business_name: "Test Lending") }
  let(:loan) { create(:loan, user: user, principal: 100_000, annual_rate: 12, term_months: 12) }

  it "renders a PDF without error" do
    pdf = described_class.new(loan, user)
    result = pdf.render
    expect(result).to be_a(Prawn::Document)
    rendered = result.render
    expect(rendered).to be_a(String)
    expect(rendered.bytes.first(4)).to eq("%PDF".bytes)
  end

  it "works for loan with payments" do
    create(:payment, loan: loan, amount: loan.monthly_payment, date: Date.new(2025, 2, 1))
    pdf = described_class.new(loan.reload, user)
    result = pdf.render
    rendered = result.render
    expect(rendered.bytes.first(4)).to eq("%PDF".bytes)
  end
end
