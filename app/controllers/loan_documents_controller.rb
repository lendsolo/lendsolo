class LoanDocumentsController < ApplicationController
  before_action :set_loan
  before_action :set_loan_document, only: [:update]

  def update
    @loan_document.update!(loan_document_params)
    redirect_to loan_path(@loan), notice: "Document updated."
  end

  private

  def set_loan
    @loan = current_user.loans.find(params[:loan_id])
  end

  def set_loan_document
    @loan_document = @loan.loan_documents.find(params[:id])
  end

  def loan_document_params
    params.require(:loan_document).permit(:status, :notes)
  end
end
