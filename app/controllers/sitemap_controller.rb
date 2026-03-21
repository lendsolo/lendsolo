class SitemapController < ApplicationController
  skip_before_action :authenticate_user!
  skip_before_action :redirect_to_onboarding

  def show
    @blog_posts = BlogPost.all
    respond_to do |format|
      format.xml
    end
  end
end
