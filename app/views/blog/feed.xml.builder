xml.instruct! :xml, version: "1.0", encoding: "UTF-8"
xml.rss version: "2.0", "xmlns:atom" => "http://www.w3.org/2005/Atom" do
  xml.channel do
    xml.title "LendSolo Blog"
    xml.description "Guides, strategies, and insights for private lenders managing their loan portfolios."
    xml.link root_url
    xml.language "en-us"
    xml.tag! "atom:link", href: blog_feed_url(format: :xml), rel: "self", type: "application/rss+xml"

    @posts.each do |post|
      xml.item do
        xml.title post.title
        xml.description post.excerpt
        xml.pubDate post.date.to_time.rfc822
        xml.link blog_post_url(slug: post.slug)
        xml.guid blog_post_url(slug: post.slug), isPermaLink: "true"
        xml.category post.category
      end
    end
  end
end
