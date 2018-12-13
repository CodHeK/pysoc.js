# encoding=utf8
import sys
from bs4 import BeautifulSoup
import requests
import csv

reload(sys)
sys.setdefaultencoding('utf8')

# Create csv file and define headers
csv_file = open('gsoc_scrape.csv', 'w')
csv_writer = csv.writer(csv_file)
csv_writer.writerow(['year','name', 'description', 'org_link', 'org_tech', 'selections'])

for i in range(6, 9):
    page = requests.get('https://summerofcode.withgoogle.com/archive/201'+str(i)+'/organizations/')

    # create a bs4 object
    soup = BeautifulSoup(page.text, 'lxml')

    title = soup.head.title.text

    # finds all orgs
    orgs = soup.findAll("li", class_="organization-card__container")

    org_count = 0;

    for org in orgs:
        # Find org name and description (def)
        org_name = org.h4.text
        org_def = org.find("div", class_="organization-card__tagline font-black-54").text

        # Link to the org page
        org_link = org.find("a", class_="organization-card__link")
        org_link = org_link['href']
        org_link = 'https://summerofcode.withgoogle.com' + org_link

        # Create a bs4 object for the org page
        org_page = requests.get(org_link)
        org_soup = BeautifulSoup(org_page.text, 'lxml')

        # Find the tech that the org uses
        org_techs = org_soup.findAll("li", class_="organization__tag organization__tag--technology")
        org_tech_list = [x.text.strip() for x in org_techs]

        # Finds the number of students who get selected in the org
        org_selections = org_soup.findAll("h5", class_="archive-project-card__student-name")
        org_selections = len(org_selections)

        year = "201"+str(i)

        csv_writer.writerow([year, org_name, org_def, org_link, org_tech_list, org_selections])
        org_count += 1
        print("Scraped " + str(org_count)+"/"+str(len(orgs)) + " in 201"+str(i))

    # Close the csv file
    print("Done Scraping for 201"+str(i))
csv_file.close()
