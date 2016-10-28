import os.path

PIE_TOLERANCE   = 0.075
IP_BAN_TIME     = 60
IP_BAN_TRIES    = 10
DEV             = True
BASE_DIR        = os.path.dirname(os.path.realpath(__file__)) + "/.."
SERIAL_FILE     = BASE_DIR + "/serial"

# error messages
E_NO_PARAMS         = "Not enough parameters given"
