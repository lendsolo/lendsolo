# Configure Inertia for testing - skip Vite asset rendering
RSpec.configure do |config|
  config.before(:each, type: :request) do
    # Allow Inertia to render without requiring Vite assets
    allow_any_instance_of(ActionView::Base).to receive(:vite_client_tag).and_return("")
    allow_any_instance_of(ActionView::Base).to receive(:vite_javascript_tag).and_return("")
    allow_any_instance_of(ActionView::Base).to receive(:vite_stylesheet_tag).and_return("")
    allow_any_instance_of(ActionView::Base).to receive(:vite_asset_path).and_return("/test-asset")
  end
end
