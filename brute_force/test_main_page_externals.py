#!/usr/bin/env python

"""
Find all external links in the main page with 3 layers or above
Also draw a network diagram
"""

import util
import networkx as nx # draw diagram
import matplotlib.pyplot as plt

from Queue import Queue

if __name__ == '__main__':
    cs_depart_urls = [
        'http://www.cs.ucla.edu/graduate-program/',
        'http://www.cs.cornell.edu/masters'
    ]

    keywords_list = [
        ['Admission'],
        []
    ]
    negative_keywords_list = [
        ['undergraduate'],
        ['undergraduate']
    ]

    max_layers = 2
    for main_url in cs_depart_urls:
        url_queue = Queue()
        url_queue.put((main_url, 'main', 0))
        url_visited = {}
        url_graph = nx.Graph()
        url_graph.add_node('main')

        while not url_queue.empty():
            url, text, layer = url_queue.get()
            if layer >= max_layers:
                # just ignore those links with larger than 3 layers
                continue

            # set visited flag
            url_visited[url] = True

            external_links = util.find_all_external_links(
                url, 
                keywords=keywords_list[layer], 
                negative_keywords=negative_keywords_list[layer])

            for external_link in external_links:
                external_url, external_text = external_link
                if external_url not in url_visited:
                    url_visited[external_url] = True
                    print 'Enqueued "' + external_text + '" ' + external_url
                    url_graph.add_node(external_text)
                    url_graph.add_edge(external_text, text)
                    url_queue.put((external_url, external_text, layer+1))

        nx.draw(url_graph)
        nx.draw_networkx_labels(url_graph, pos=nx.spring_layout(url_graph))
        plt.show()