xml.instruct! :xml, version: "1.0", encoding: "UTF-8"
xml.urlset xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" do
  # Landing page
  xml.url do
    xml.loc root_url
    xml.changefreq "weekly"
    xml.priority "1.0"
  end

  # Calculator tools
  %w[
    tools/loan-amortization-calculator
    tools/roi-calculator
    tools/loan-comparison
    tools/interest-only-calculator
  ].each do |path|
    xml.url do
      xml.loc "#{root_url}#{path}"
      xml.changefreq "monthly"
      xml.priority "0.8"
    end
  end

  # Blog index
  xml.url do
    xml.loc blog_url
    xml.changefreq "weekly"
    xml.priority "0.8"
  end

  # Blog posts
  @blog_posts.each do |post|
    xml.url do
      xml.loc blog_post_url(slug: post.slug)
      xml.lastmod post.date.iso8601
      xml.changefreq "monthly"
      xml.priority "0.7"
    end
  end
end
