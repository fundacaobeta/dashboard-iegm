output "pages_url" {
  description = "The URL of the deployed Cloudflare Pages project."
  value       = cloudflare_pages_project.main.subdomain
}

output "d1_database_id" {
  description = "The ID of the D1 database."
  value       = cloudflare_d1_database.main.id
}
