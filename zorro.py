import csv
import tornado

def main():
	f = open('names_20161004.csv', 'r')
	try:
		reader = csv.reader(f)
		for row in reader:
			# Using the requests module
			# iterate through each row and pull info
			t = Tornado(row)
	except Exception as e:
		print "Error reading from csv file: {}".format(e)
	finally:
		f.close()

if __name__ == "__main__":
	main()