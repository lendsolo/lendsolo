require "rails_helper"

RSpec.describe Pdf::YearEndSummaryPdf do
  let(:user) { create(:user, business_name: "Test Lending") }

  it "renders a PDF for year with no data" do
    pdf = described_class.new(user, 2025)
    result = pdf.render
    expect(result).to be_a(Prawn::Document)
    rendered = result.render
    expect(rendered.bytes.first(4)).to eq("%PDF".bytes)
  end

  it "renders a PDF for year with loan data" do
    loan = create(:loan, user: user, start_date: Date.new(2025, 1, 1))
    create(:payment, loan: loan, amount: loan.monthly_payment, date: Date.new(2025, 2, 1))
    create(:expense, user: user, date: Date.new(2025, 3, 1))

    pdf = described_class.new(user, 2025)
    result = pdf.render
    rendered = result.render
    expect(rendered.bytes.first(4)).to eq("%PDF".bytes)
  end
end
