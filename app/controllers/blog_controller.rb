class BlogController < ApplicationController
  skip_before_action :authenticate_user!
  skip_before_action :redirect_to_onboarding

  def index
    posts = BlogPost.all
    categories = BlogPost::CATEGORIES

    if params[:category].present?
      posts = posts.select { |p| p.category == params[:category] }
    end

    render inertia: "Blog/Index", props: {
      posts: posts.map(&:as_json),
      categories: categories,
      activeCategory: params[:category] || nil
    }
  end

  def show
    post = BlogPost.find_by_slug!(params[:slug])
    related = post.related_posts(3)

    render inertia: "Blog/Show", props: {
      post: post.as_full_json,
      relatedPosts: related.map(&:as_json)
    }
  end

  # GET /blog/feed.xml
  def feed
    @posts = BlogPost.all.first(20)
    respond_to do |format|
      format.xml
    end
  end
end
