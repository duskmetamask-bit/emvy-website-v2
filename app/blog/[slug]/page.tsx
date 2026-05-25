import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageHero from '../../../components/PageHero'

const posts: Record<string, { title: string; summary: string; image: string }> = {
  'ai-agents-business': {
    title: 'How AI agents actually fit into a business',
    summary: 'A practical guide to where agents help, where they do not, and how to deploy them well.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1800&q=90&auto=format&fit=crop',
  },
  'ai-automation-stacks': {
    title: 'What a good automation stack looks like',
    summary: 'The tools, handoffs, and controls that matter when you want automation to be reliable.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1800&q=90&auto=format&fit=crop',
  },
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts[params.slug]

  if (!post) notFound()

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title={post.title}
        description={post.summary}
        image={post.image}
      >
        <Link href="/blog" className="button light">
          Back to blog
        </Link>
        <Link href="/quiz" className="button secondary">
          Start the quiz
        </Link>
      </PageHero>

      <section className="section">
        <div className="proof-card">
          <p>
            This is the space for a practical article body, supporting examples, and internal links
            that help the reader move to the next useful page.
          </p>
          <p>
            Each post should answer a real question, show what matters, and keep the next step
            obvious without feeling salesy.
          </p>
        </div>
      </section>
    </>
  )
}
