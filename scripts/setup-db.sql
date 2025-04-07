-- Create the festivals table
create table festivals (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  date date not null,
  website text,
  num_acts integer,
  locations text[],
  capacity integer,
  status text default 'active',
  is_interested boolean default false,
  source text not null,
  last_updated timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Create indexes for common queries
create index festivals_date_idx on festivals(date);
create index festivals_status_idx on festivals(status);
create index festivals_is_interested_idx on festivals(is_interested);

-- Create a function to update the last_updated timestamp
create or replace function update_last_updated()
returns trigger as $$
begin
  new.last_updated = now();
  return new;
end;
$$ language plpgsql;

-- Create a trigger to automatically update last_updated
create trigger update_festivals_last_updated
  before update on festivals
  for each row
  execute function update_last_updated();

-- Enable Row Level Security (RLS)
alter table festivals enable row level security;

-- Create a policy that allows all operations for now
-- You can restrict this later based on user roles
create policy "Allow all operations for now"
  on festivals
  for all
  using (true)
  with check (true); 