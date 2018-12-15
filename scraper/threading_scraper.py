# encoding=utf8
import sys
from bs4 import BeautifulSoup
import requests
import csv
from multiprocessing import Pool
from firebase import firebase
import json

reload(sys)
sys.setdefaultencoding('utf8')
sys.setrecursionlimit(12000)

# firebase database
firebase = firebase.FirebaseApplication('https://pysoc-55cd4.firebaseio.com', None)


orgs_data = []
def scrape(org):
    (org, year) = org
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

    data = {
        'year': year,
        'org_name': org_name,
        'org_def': org_def,
        'org_link': org_link,
        'org_tech_list': org_tech_list,
        'org_selections': org_selections
    }
    result = firebase.post("/orgs", data)
    print(data)

def startScraping():
    orgs = []
    for i in range(6, 9):
        page = requests.get('https://summerofcode.withgoogle.com/archive/201'+str(i)+'/organizations/')
        soup = BeautifulSoup(page.text, 'lxml')
        title = soup.head.title.text
        org_per_year = soup.findAll("li", class_="organization-card__container")
        orgs.append({ 'org_data': org_per_year, 'year': '201'+str(i) })

    # multithreading
    for org in orgs:
        year = org['year']
        org = org['org_data']
        for i in range(len(org)):
            org[i] = (org[i], year)
        p = Pool(10)
        records = p.map(scrape, org)
        p.terminate()
        p.join()
    print("Done Scraping")

def getScrapedData():
    result = firebase.get("/orgs", "")
    print(len(result))

def Analyse():
    result = firebase.get("/orgs", "")
    for key,val in result.iteritems():
        print(val['org_name'])
        break


Analyse()
