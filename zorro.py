import csv
def main():
	f = open('names_20161004.csv', 'r')
	try:
		reader = csv.reader(f)
		for row in reader:
			# Using the requests module
			# iterate through each row and pull info
			print row[0]
			pass
	except Exception as e:
		print "Error reading from csv file: {}".format(e)
	finally:
		f.close()

if __name__ == "__main__":
	main()