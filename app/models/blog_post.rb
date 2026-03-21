# Plain Ruby model — reads Markdown files from content/blog/*.md
# Parsed at request time, cached in production via Rails.cache
class BlogPost
  CONTENT_DIR = Rails.root.join("content", "blog")
  CATEGORIES = [
    "Getting Started",
    "Tax & Compliance",
    "Deal Analysis",
    "Loan Structures",
    "Portfolio Strategy"
  ].freeze

  attr_reader :title, :slug, :date, :category, :excerpt,
              :meta_title, :meta_description, :body_html, :body_raw,
              :headings, :word_count, :read_time

  def initialize(front_matter, body_html, body_raw, headings)
    @title = front_matter["title"]
    @slug = front_matter["slug"]
    @date = front_matter["date"].is_a?(Date) ? front_matter["date"] : Date.parse(front_matter["date"].to_s)
    @category = front_matter["category"]
    @excerpt = front_matter["excerpt"]
    @meta_title = front_matter["meta_title"] || @title
    @meta_description = front_matter["meta_description"] || @excerpt
    @body_html = body_html
    @body_raw = body_raw
    @headings = headings
    @word_count = body_raw.split(/\s+/).size
    @read_time = [ (@word_count / 238.0).ceil, 1 ].max
  end

  # ------------------------------------------------------------------
  # Finders
  # ------------------------------------------------------------------

  def self.all
    cache_key = "blog_posts:all:#{dir_fingerprint}"
    cached = Rails.cache.read(cache_key)
    return cached if cached

    posts = markdown_files.map { |path| parse(path) }
                          .compact
                          .sort_by(&:date)
                          .reverse

    Rails.cache.write(cache_key, posts, expires_in: 1.hour) if Rails.env.production?
    posts
  end

  def self.find_by_slug!(slug)
    post = all.find { |p| p.slug == slug }
    raise ActiveRecord::RecordNotFound, "Blog post '#{slug}' not found" unless post
    post
  end

  def self.by_category(category)
    all.select { |p| p.category == category }
  end

  # Posts in the same category, excluding self
  def related_posts(limit = 3)
    self.class.all
        .select { |p| p.category == category && p.slug != slug }
        .first(limit)
  end

  # ------------------------------------------------------------------
  # Serialization for Inertia
  # ------------------------------------------------------------------

  def as_json(_opts = {})
    {
      title: title,
      slug: slug,
      date: date.iso8601,
      category: category,
      excerpt: excerpt,
      meta_title: meta_title,
      meta_description: meta_description,
      read_time: read_time,
      word_count: word_count
    }
  end

  def as_full_json
    as_json.merge(
      body_html: body_html,
      headings: headings
    )
  end

  # ------------------------------------------------------------------
  private
  # ------------------------------------------------------------------

  def self.markdown_files
    Dir.glob(CONTENT_DIR.join("*.md")).sort
  end

  def self.dir_fingerprint
    markdown_files.map { |f| "#{f}:#{File.mtime(f).to_i}" }.join("|")
  end

  def self.parse(path)
    raw = File.read(path)
    parsed = FrontMatterParser::Parser.new(:md).call(raw)
    front_matter = parsed.front_matter
    body_md = parsed.content

    return nil if front_matter["title"].blank?

    # Render markdown to HTML
    renderer = RougeRenderer.new(hard_wrap: true, with_toc_data: true)
    markdown = Redcarpet::Markdown.new(renderer,
      fenced_code_blocks: true,
      tables: true,
      autolink: true,
      strikethrough: true,
      highlight: true,
      no_intra_emphasis: true
    )

    body_html = markdown.render(body_md)

    # Extract headings for table of contents
    headings = extract_headings(body_md)

    new(front_matter, body_html, body_md, headings)
  rescue => e
    Rails.logger.error "[BlogPost] Failed to parse #{path}: #{e.message}"
    nil
  end

  def self.extract_headings(markdown_body)
    markdown_body.scan(/^(\#{2,3})\s+(.+)$/).map do |level, text|
      {
        level: level.length,
        text: text.strip,
        id: text.strip.downcase.gsub(/[^a-z0-9\s-]/, "").gsub(/\s+/, "-")
      }
    end
  end

  # Custom Redcarpet renderer with Rouge syntax highlighting
  class RougeRenderer < Redcarpet::Render::HTML
    def block_code(code, language)
      language ||= "text"
      formatter = Rouge::Formatters::HTML.new
      lexer = Rouge::Lexer.find_fancy(language) || Rouge::Lexers::PlainText.new
      %(<pre class="highlight"><code class="language-#{language}">#{formatter.format(lexer.lex(code))}</code></pre>)
    end
  end
end
