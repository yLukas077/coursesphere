puts "Cleaning database..."
Lesson.destroy_all
Course.destroy_all
User.destroy_all

puts "Creating users..."
demo = User.create!(name: "Demo User",  email: "demo@coursesphere.dev",  password: "password123")
ana  = User.create!(name: "Ana Souza",   email: "ana@coursesphere.dev",   password: "password123")

puts "Creating courses + lessons..."
c1 = demo.created_courses.create!(
  name: "Introdução ao Ruby on Rails",
  description: "Curso prático cobrindo MVC, ActiveRecord, rotas e APIs.",
  start_date: Date.today,
  end_date:   Date.today + 30
)
c1.lessons.create!(title: "Setup do ambiente", status: "published")
c1.lessons.create!(title: "Models e migrations", status: "published", video_url: "https://example.com/video1")
c1.lessons.create!(title: "Controllers e rotas", status: "draft")

c2 = ana.created_courses.create!(
  name: "React do zero ao deploy",
  description: "Hooks, Context, TanStack Query e deploy na Vercel.",
  start_date: Date.today + 7,
  end_date:   Date.today + 45
)
c2.lessons.create!(title: "Componentes e props", status: "published")
c2.lessons.create!(title: "Hooks essenciais", status: "draft")

puts "Done. Login: demo@coursesphere.dev / password123"
