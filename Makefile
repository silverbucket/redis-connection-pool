##
# This file is part of node-redis-pool
#
# © 2013 Nick Jennings (https://github.com/silverbucket)
#
# licensed under the AGPLv3.
# See the LICENSE file for details.
#
# The latest version of sockethub-client can be found here:
#		https://github.com/silverbucket/node-redis-pool
#
# For more information about sockethub visit http://sockethub.org/.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
#
#

BUILD_OPTIONS = -o baseUrl=src name=vendor/almond include=sockethub-client wrap.startFile=build/start.frag wrap.endFile=build/end.frag

default: doc

doc:
	naturaldocs -i src/ -o html doc -p doc/.config

.PHONY: default doc
