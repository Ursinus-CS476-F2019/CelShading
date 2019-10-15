import numpy as np
import matplotlib.pyplot as plt
import matplotlib.image
from sklearn.cluster import KMeans
from sys import argv, exit
from skimage import feature, filters

def kmeans_quantize(I, NLevels):
    X = np.reshape(I, (I.shape[0]*I.shape[1], 3))
    kmeans = KMeans(n_clusters=NLevels, random_state=0).fit(X)
    colors = kmeans.cluster_centers_
    idx = kmeans.labels_
    IRet = colors[idx, :]
    return np.reshape(IRet, I.shape)

def uniform_quantize(I, NLevels):
    K = (np.round(NLevels**(1.0/3.0))**3)**(1.0/3.0)
    levels = np.linspace(0, 1, K+2)[1:-1]
    minDists = np.inf*np.ones((I.shape[0]*I.shape[1]))
    Ic = np.reshape(I, (I.shape[0]*I.shape[1], 3))
    IRet = np.zeros_like(Ic)
    for r in levels:
        for g in levels:
            for b in levels:
                rgb = np.array([[r, g, b]])
                dists = np.sqrt(np.sum((Ic - rgb)**2, 1))
                IRet[dists < minDists, :] = rgb
                minDists[dists < minDists] = dists[dists < minDists]
    return np.reshape(IRet, I.shape)


def superimpose_edges(I, Canny):
    IRet = np.array(I)
    for c in range(3):
        Ic = IRet[:, :, c]
        Ic[Canny > 0] = 0
        IRet[:, :, c] = Ic
    return IRet

if __name__ == '__main__':
    if (len(argv) < 4):
        print("Usage: python quantize.py <image path> <number of levels> <edge sigma>")
        exit(0)
    I = matplotlib.image.imread(argv[1])/255.0
    NLevels = int(argv[2])
    IGray = 0.3*I[:, :, 0] + 0.59*I[:, :, 1] + 0.11*I[:, :, 2]

    # Canny edge detection
    Canny = feature.canny(IGray, sigma=float(argv[3]))

    # Grayscale quantization
    fac = np.floor(IGray*NLevels+0.5)/NLevels
    IQuant = fac[:, :, None]*I
    IQuant = superimpose_edges(IQuant, Canny)

    # Uniform Quantization
    IUnif = uniform_quantize(I, NLevels)
    IUnif = superimpose_edges(IUnif, Canny)

    # Kmeans quantization
    KQuant = kmeans_quantize(I, NLevels)
    KQuant = superimpose_edges(KQuant, Canny)

    plt.subplot(141)
    plt.imshow(I)
    plt.axis('off')
    plt.title("Original")

    plt.subplot(142)
    plt.imshow(Canny)
    plt.axis('off')
    plt.title("Edges")

    """
    plt.subplot(234)
    plt.imshow(IQuant)
    plt.axis('off')
    plt.title("Grayscale Quantized")
    """

    plt.subplot(143)
    plt.imshow(IUnif)
    plt.axis('off')
    plt.title("Uniformly Quantized")

    plt.subplot(144)
    plt.imshow(KQuant)
    plt.axis('off')
    plt.title("KMeans Quantized")

    plt.show()